"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { DispatchRequestRepository } from "@/lib/repositories/dispatch-request.repository";
import { StoreQuickSlotUsageRepository } from "@/lib/repositories/store-quick-slot-usage.repository";
import { createDispatchRequestSchema, closeSlotSchema } from "@/lib/schemas/domain/shipment.schema";

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

    // 해당 슬롯의 사용량 조회
    const { data, error } = await supabase
      .from("store_quick_slot_usage")
      .select("*")
      .eq("store_id", store_id)
      .eq("depart_date", depart_date)
      .eq("depart_time", depart_time)
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (data) {
      // 기존 슬롯 업데이트 (reserved_count를 capacity 초과로 설정하여 마감)
      return repo.update(data.usage_id, { reserved_count: 9999 });
    } else {
      // 새 슬롯 생성 (마감 상태로)
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
