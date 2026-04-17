"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { DispatchRequestRepository } from "@/lib/repositories/dispatch-request.repository";
import { StoreQuickSlotUsageRepository } from "@/lib/repositories/store-quick-slot-usage.repository";
import { ShipmentRepository } from "@/lib/repositories/shipment.repository";
import { SellerRepository } from "@/lib/repositories/seller.repository";
import {
  createDispatchRequestSchema,
  closeSlotSchema,
  fetchShipmentsSchema,
  fetchBbqGroupsSchema,
  batchDeliverySchema,
} from "@/lib/schemas/domain/shipment.schema";
import type { ShipmentWithOrder, BbqAddressGroup } from "@/lib/repositories/shipment.repository";

/** 배송 요청 생성 */
export const createDispatchRequest = withAction(
  createDispatchRequestSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new DispatchRequestRepository(supabase);
    return repo.create({
      order_id: input.order_id,
      store_id: input.store_id,
      status: "REQUESTED",
    });
  },
  { action: "CREATE", resource: "DISPATCH_REQUEST" }
);

/** 바로퀵 슬롯 마감 처리 */
export const closeSlot = withAction(
  closeSlotSchema,
  async ({ store_id, depart_date, depart_time }) => {
    const supabase = createAdminClient();
    const repo = new StoreQuickSlotUsageRepository(supabase);

    const { data, error } = await supabase
      .from("store_quick_slot_usage")
      .select("*")
      .eq("store_id", store_id)
      .eq("depart_date", depart_date)
      .eq("depart_time", depart_time)
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (data) {
      return repo.update(data.usage_id, { reserved_count: 9999 });
    } else {
      return repo.create({
        store_id,
        depart_date,
        depart_time,
        reserved_count: 9999,
      });
    }
  },
  { action: "UPDATE", resource: "SLOT" }
);

/** 가게 + 날짜 범위로 배송 목록 조회 */
export const fetchShipmentsByStore = withAction(
  fetchShipmentsSchema,
  async ({ store_id, from_date, to_date }): Promise<ShipmentWithOrder[]> => {
    const supabase = createAdminClient();
    const repo = new ShipmentRepository(supabase);
    return repo.findByStoreAndDateRange(store_id, from_date, to_date);
  },
  { action: "READ", resource: "SHIPMENT" }
);

/** BBQ 배송건을 배송지별로 그룹화하여 조회 */
export const fetchBbqShipmentGroups = withAction(
  fetchBbqGroupsSchema,
  async ({ store_id, from_date, to_date }): Promise<BbqAddressGroup[]> => {
    const supabase = createAdminClient();
    const repo = new ShipmentRepository(supabase);
    return repo.findBbqGroupedByAddress(store_id, from_date, to_date);
  },
  { action: "READ", resource: "SHIPMENT" }
);

/** 배송 출발 일괄 처리 */
export const batchStartDelivery = withAction(
  batchDeliverySchema,
  async ({ shipment_ids }) => {
    const sessionClient = await createClient();
    const {
      data: { user },
    } = await sessionClient.auth.getUser();

    if (!user?.email) throw new Error("인증 정보가 없습니다.");

    const adminSupabase = createAdminClient();
    const sellerRepo = new SellerRepository(adminSupabase);
    const sellers = await sellerRepo.findByEmail(user.email);
    const riderId = sellers[0]?.seller_id;
    if (!riderId) throw new Error("라이더 정보를 찾을 수 없습니다.");

    const repo = new ShipmentRepository(adminSupabase);
    await Promise.all(shipment_ids.map((id) => repo.startDelivery(id, riderId)));
    return { count: shipment_ids.length };
  },
  { action: "UPDATE", resource: "SHIPMENT" }
);

/** 배송 완료 일괄 처리 */
export const batchCompleteDelivery = withAction(
  batchDeliverySchema,
  async ({ shipment_ids }) => {
    const sessionClient = await createClient();
    const {
      data: { user },
    } = await sessionClient.auth.getUser();

    if (!user?.email) throw new Error("인증 정보가 없습니다.");

    const adminSupabase = createAdminClient();
    const sellerRepo = new SellerRepository(adminSupabase);
    const sellers = await sellerRepo.findByEmail(user.email);
    const riderId = sellers[0]?.seller_id;
    if (!riderId) throw new Error("라이더 정보를 찾을 수 없습니다.");

    const repo = new ShipmentRepository(adminSupabase);
    await Promise.all(shipment_ids.map((id) => repo.completeDelivery(id, riderId)));
    return { count: shipment_ids.length };
  },
  { action: "UPDATE", resource: "SHIPMENT" }
);
