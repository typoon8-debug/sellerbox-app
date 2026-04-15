import type { Database } from "@/lib/supabase/database.types";

// ─── 프로모션 ─────────────────────────────────────────────────────────────────
export type PromotionRow = Database["public"]["Tables"]["promotion"]["Row"];
export type PromotionInsert = Database["public"]["Tables"]["promotion"]["Insert"];
export type PromotionUpdate = Database["public"]["Tables"]["promotion"]["Update"];

// ─── 프로모션 상품 ────────────────────────────────────────────────────────────
export type PromotionItemRow = Database["public"]["Tables"]["promotion_item"]["Row"];
export type PromotionItemInsert = Database["public"]["Tables"]["promotion_item"]["Insert"];
export type PromotionItemUpdate = Database["public"]["Tables"]["promotion_item"]["Update"];

// ─── 쿠폰 ─────────────────────────────────────────────────────────────────────
export type CouponRow = Database["public"]["Tables"]["coupon"]["Row"];
export type CouponInsert = Database["public"]["Tables"]["coupon"]["Insert"];
export type CouponUpdate = Database["public"]["Tables"]["coupon"]["Update"];

// ─── 쿠폰 발급 (ERD 원문 철자: coupon_issurance) ─────────────────────────────
export type CouponIssuanceRow = Database["public"]["Tables"]["coupon_issurance"]["Row"];
export type CouponIssuanceInsert = Database["public"]["Tables"]["coupon_issurance"]["Insert"];
export type CouponIssuanceUpdate = Database["public"]["Tables"]["coupon_issurance"]["Update"];

// ─── 쿠폰 사용 ────────────────────────────────────────────────────────────────
export type CouponRedemptionRow = Database["public"]["Tables"]["coupon_redemption"]["Row"];
export type CouponRedemptionInsert = Database["public"]["Tables"]["coupon_redemption"]["Insert"];
export type CouponRedemptionUpdate = Database["public"]["Tables"]["coupon_redemption"]["Update"];
