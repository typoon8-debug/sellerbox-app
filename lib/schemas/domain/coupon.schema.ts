import { z } from "zod";

export const createCouponSchema = z.object({
  store_id: z.string().uuid(),
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

export const issueCouponSchema = z.object({
  coupon_id: z.string().uuid("올바른 쿠폰 ID를 입력해 주세요."),
  customer_id: z.string().uuid().optional().nullable(),
  expires_at: z.string().optional().nullable(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type IssueCouponInput = z.infer<typeof issueCouponSchema>;
