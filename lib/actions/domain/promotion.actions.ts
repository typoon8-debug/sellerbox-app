"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { PromotionRepository } from "@/lib/repositories/promotion.repository";
import { PromotionItemRepository } from "@/lib/repositories/promotion-item.repository";
import { ItemRepository } from "@/lib/repositories/item.repository";
import {
  createPromotionSchema,
  updatePromotionSchema,
  addPromotionItemSchema,
  fetchPromotionsByStoreSchema,
  fetchPromotionTabsSchema,
  softDeletePromotionSchema,
  updatePromotionItemSchema,
  softDeletePromotionItemSchema,
} from "@/lib/schemas/domain/promotion.schema";

/** 프로모션 생성 */
export const createPromotion = withAction(
  createPromotionSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new PromotionRepository(supabase);
    return repo.create(input);
  },
  { action: "CREATE", resource: "PROMOTION" }
);

/** 프로모션 수정 */
export const updatePromotion = withAction(
  updatePromotionSchema,
  async ({ promo_id, ...rest }) => {
    const supabase = createAdminClient();
    const repo = new PromotionRepository(supabase);
    return repo.update(promo_id, rest);
  },
  { action: "UPDATE", resource: "PROMOTION" }
);

/** 가게별 프로모션 목록 조회 */
export const fetchPromotionsByStore = withAction(
  fetchPromotionsByStoreSchema,
  async ({ store_id }) => {
    const supabase = createAdminClient();
    const repo = new PromotionRepository(supabase);
    return repo.findByStoreId(store_id);
  },
  { action: "READ", resource: "PROMOTION" }
);

/** 프로모션 소프트 삭제 (status = ENDED) */
export const softDeletePromotion = withAction(
  softDeletePromotionSchema,
  async ({ promo_id }) => {
    const supabase = createAdminClient();
    const repo = new PromotionRepository(supabase);
    return repo.softDelete(promo_id);
  },
  { action: "DELETE", resource: "PROMOTION" }
);

/** 프로모션 탭 데이터 조회 (프로모션 상품 + 가게 상품 동시) */
export const fetchPromotionTabs = withAction(
  fetchPromotionTabsSchema,
  async ({ promo_id, store_id }) => {
    const supabase = createAdminClient();
    const promoItemRepo = new PromotionItemRepository(supabase);
    const itemRepo = new ItemRepository(supabase);

    const [promotionItems, storeItemsResult] = await Promise.all([
      promoItemRepo.findByPromoId(promo_id),
      itemRepo.paginate({ page: 1, pageSize: 200, filters: { store_id, status: "ACTIVE" } }),
    ]);

    return { promotionItems, storeItems: storeItemsResult.data };
  },
  { action: "READ", resource: "PROMOTION_ITEM" }
);

/** 프로모션 상품 추가 */
export const addPromotionItem = withAction(
  addPromotionItemSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new PromotionItemRepository(supabase);
    return repo.create(input);
  },
  { action: "CREATE", resource: "PROMOTION_ITEM" }
);

/** 프로모션 상품 수정 */
export const updatePromotionItem = withAction(
  updatePromotionItemSchema,
  async ({ id, ...rest }) => {
    const supabase = createAdminClient();
    const repo = new PromotionItemRepository(supabase);
    return repo.update(id, rest);
  },
  { action: "UPDATE", resource: "PROMOTION_ITEM" }
);

/** 프로모션 상품 소프트 삭제 (status = INACTIVE) */
export const softDeletePromotionItem = withAction(
  softDeletePromotionItemSchema,
  async ({ id }) => {
    const supabase = createAdminClient();
    const repo = new PromotionItemRepository(supabase);
    return repo.softDelete(id);
  },
  { action: "DELETE", resource: "PROMOTION_ITEM" }
);
