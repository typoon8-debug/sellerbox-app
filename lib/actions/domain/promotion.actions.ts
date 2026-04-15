"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { PromotionRepository } from "@/lib/repositories/promotion.repository";
import { PromotionItemRepository } from "@/lib/repositories/promotion-item.repository";
import {
  createPromotionSchema,
  updatePromotionSchema,
  addPromotionItemSchema,
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
