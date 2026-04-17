import { z } from "zod";

export const createPromotionSchema = z.object({
  store_id: z.string().uuid(),
  name: z.string().min(1, "프로모션명을 입력해 주세요."),
  type: z.enum([
    "SALE",
    "DISCOUNT_PCT",
    "DISCOUNT_FIXED",
    "ONE_PLUS_ONE",
    "TWO_PLUS_ONE",
    "BUNDLE",
  ]),
  discount_unit: z.enum(["PCT", "FIXED"]).optional().nullable(),
  discount_value: z.number().min(0).optional().nullable(),
  bundle_price: z.number().min(0).optional().nullable(),
  priority: z.number().int().min(0).default(0),
  stackable: z.number().int().min(0).max(1).default(0),
  flash_enabled: z.number().int().min(0).max(1).default(0),
  flash_time_start: z.string().optional().nullable(),
  flash_time_end: z.string().optional().nullable(),
  flash_dow_mask: z.string().optional().nullable(),
  max_usage: z.number().int().min(1).optional().nullable(),
  per_user_limit: z.number().int().min(1).optional().nullable(),
  start_at: z.string().min(1, "시작일을 입력해 주세요."),
  end_at: z.string().min(1, "종료일을 입력해 주세요."),
  status: z.enum(["SCHEDULED", "ACTIVE", "PAUSED", "ENDED"]).default("SCHEDULED"),
});

export const updatePromotionSchema = z.object({
  promo_id: z.string().uuid(),
  name: z.string().min(1).optional(),
  status: z.enum(["SCHEDULED", "ACTIVE", "PAUSED", "ENDED"]).optional(),
  start_at: z.string().optional(),
  end_at: z.string().optional(),
  priority: z.number().int().min(0).optional(),
  max_usage: z.number().int().min(1).optional().nullable(),
  per_user_limit: z.number().int().min(1).optional().nullable(),
});

export const addPromotionItemSchema = z.object({
  promo_id: z.string().uuid(),
  item_id: z.string().uuid(),
  condition_qty: z.number().int().min(1).optional().nullable(),
  reward_qty: z.number().int().min(1).optional().nullable(),
  reward_item_id: z.string().uuid().optional().nullable(),
  limit_per_order: z.number().int().min(1).optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const fetchPromotionsByStoreSchema = z.object({
  store_id: z.string().min(1, "가게 ID가 필요합니다."),
});

export const fetchPromotionTabsSchema = z.object({
  promo_id: z.string().min(1, "프로모션 ID가 필요합니다."),
  store_id: z.string().min(1, "가게 ID가 필요합니다."),
});

export const softDeletePromotionSchema = z.object({
  promo_id: z.string().min(1, "프로모션 ID가 필요합니다."),
});

export const updatePromotionItemSchema = z.object({
  id: z.string().min(1, "프로모션 상품 ID가 필요합니다."),
  condition_qty: z.number().int().min(1).optional().nullable(),
  reward_qty: z.number().int().min(1).optional().nullable(),
  reward_item_id: z.string().min(1).optional().nullable(),
  limit_per_order: z.number().int().min(1).optional().nullable(),
});

export const softDeletePromotionItemSchema = z.object({
  id: z.string().min(1, "프로모션 상품 ID가 필요합니다."),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
export type AddPromotionItemInput = z.infer<typeof addPromotionItemSchema>;
export type FetchPromotionsByStoreInput = z.infer<typeof fetchPromotionsByStoreSchema>;
export type FetchPromotionTabsInput = z.infer<typeof fetchPromotionTabsSchema>;
export type SoftDeletePromotionInput = z.infer<typeof softDeletePromotionSchema>;
export type UpdatePromotionItemInput = z.infer<typeof updatePromotionItemSchema>;
export type SoftDeletePromotionItemInput = z.infer<typeof softDeletePromotionItemSchema>;
