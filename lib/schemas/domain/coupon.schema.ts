import { z } from "zod";

// ─── 쿠폰 등록 ────────────────────────────────────────────────────────────────
export const createCouponSchema = z.object({
  store_id: z.string().min(1, "가게 ID가 필요합니다."),
  name: z.string().min(1, "쿠폰명을 입력해 주세요."),
  coupon_type: z.enum(["DISCOUNT", "SHIPPING_FREE", "SIGNUP"]),
  discount_unit: z.enum(["PCT", "FIXED"]),
  discount_value: z.number().min(0, "할인 금액은 0 이상이어야 합니다."),
  shipping_max_free: z.number().min(0).default(0),
  min_order_amount: z.number().min(0).default(0),
  valid_from: z.string().optional(),
  valid_to: z.string().min(1, "유효 종료일을 입력해 주세요."),
  total_issuable: z.number().int().min(1).default(100),
  per_customer_limit: z.number().int().min(1).default(1),
  stackable: z.number().int().min(0).max(1).default(0),
  status: z.enum(["ISSUED", "USED", "EXPIRED", "CANCELLED"]).default("ISSUED"),
});

// ─── 쿠폰 수정 ────────────────────────────────────────────────────────────────
export const updateCouponSchema = z.object({
  coupon_id: z.string().min(1),
  name: z.string().min(1, "쿠폰명을 입력해 주세요.").optional(),
  coupon_type: z.enum(["DISCOUNT", "SHIPPING_FREE", "SIGNUP"]).optional(),
  discount_unit: z.enum(["PCT", "FIXED"]).optional(),
  discount_value: z.number().min(0).optional(),
  shipping_max_free: z.number().min(0).optional(),
  min_order_amount: z.number().min(0).optional(),
  valid_from: z.string().optional(),
  valid_to: z.string().optional(),
  total_issuable: z.number().int().min(1).optional(),
  per_customer_limit: z.number().int().min(1).optional(),
  stackable: z.number().int().min(0).max(1).optional(),
  status: z.enum(["ISSUED", "USED", "EXPIRED", "CANCELLED"]).optional(),
});

// ─── 쿠폰 소프트 삭제 ────────────────────────────────────────────────────────
export const softDeleteCouponSchema = z.object({
  coupon_id: z.string().min(1),
});

// ─── 가게별 쿠폰 목록 조회 ────────────────────────────────────────────────────
export const fetchCouponsByStoreSchema = z.object({
  store_id: z.string().min(1),
});

// ─── 쿠폰 탭 데이터 조회 ─────────────────────────────────────────────────────
export const fetchCouponTabsSchema = z.object({
  coupon_id: z.string().min(1),
});

// ─── 쿠폰 발급 ────────────────────────────────────────────────────────────────
export const issueCouponSchema = z.object({
  coupon_id: z.string().min(1, "쿠폰 ID가 필요합니다."),
  customer_id: z.string().optional().nullable(),
  expires_at: z.string().optional().nullable(),
});

// ─── 발급 취소 ────────────────────────────────────────────────────────────────
export const cancelIssuanceSchema = z.object({
  issuance_id: z.string().min(1),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type IssueCouponInput = z.infer<typeof issueCouponSchema>;
