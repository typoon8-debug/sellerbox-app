"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { StoreRepository } from "@/lib/repositories/store.repository";
import { StoreFulfillmentRepository } from "@/lib/repositories/store-fulfillment.repository";
import { SellerRepository } from "@/lib/repositories/seller.repository";
import { StoreQuickPolicyRepository } from "@/lib/repositories/store-quick-policy.repository";
import { StoreQuickTimeslotRepository } from "@/lib/repositories/store-quick-timeslot.repository";
import { StoreQuickSlotUsageRepository } from "@/lib/repositories/store-quick-slot-usage.repository";
import { z } from "zod";

const fetchStoresByTenantSchema = z.object({
  tenant_id: z.string().uuid("올바른 테넌트 ID를 입력해 주세요."),
});

const fetchStoreDetailSchema = z.object({
  store_id: z.string().uuid("올바른 가게 ID를 입력해 주세요."),
});

const fetchStoreInfoTabsSchema = z.object({
  store_id: z.string().uuid("올바른 가게 ID를 입력해 주세요."),
});

/** 테넌트별 가게 목록 조회 */
export const fetchStoresByTenant = withAction(fetchStoresByTenantSchema, async ({ tenant_id }) => {
  const supabase = createAdminClient();
  const repo = new StoreRepository(supabase);
  return repo.findByTenantId(tenant_id);
});

/** 가게 상세 정보 조회 */
export const fetchStoreDetail = withAction(fetchStoreDetailSchema, async ({ store_id }) => {
  const supabase = createAdminClient();
  const repo = new StoreRepository(supabase);
  return repo.findById(store_id);
});

/** 가게 정보 탭 데이터 일괄 조회 (배송정보, 판매원, 바로퀵정책, 운행표, 슬롯카운트) */
export const fetchStoreInfoTabs = withAction(fetchStoreInfoTabsSchema, async ({ store_id }) => {
  const supabase = createAdminClient();
  const filters = { store_id };

  const [fulfillments, sellers, quickPolicies, timeslots, slotUsages] = await Promise.all([
    new StoreFulfillmentRepository(supabase).paginate({ page: 1, pageSize: 100, filters }),
    new SellerRepository(supabase).paginate({ page: 1, pageSize: 100, filters }),
    new StoreQuickPolicyRepository(supabase).paginate({ page: 1, pageSize: 100, filters }),
    new StoreQuickTimeslotRepository(supabase).paginate({ page: 1, pageSize: 100, filters }),
    new StoreQuickSlotUsageRepository(supabase).paginate({ page: 1, pageSize: 100, filters }),
  ]);

  return {
    fulfillments: fulfillments.data,
    sellers: sellers.data,
    quickPolicies: quickPolicies.data,
    timeslots: timeslots.data,
    slotUsages: slotUsages.data,
  };
});
