"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { CouponRepository } from "@/lib/repositories/coupon.repository";
import { CouponIssuanceRepository } from "@/lib/repositories/coupon-issuance.repository";
import { CouponRedemptionRepository } from "@/lib/repositories/coupon-redemption.repository";
import {
  createCouponSchema,
  updateCouponSchema,
  softDeleteCouponSchema,
  fetchCouponsByStoreSchema,
  fetchCouponTabsSchema,
  issueCouponSchema,
  cancelIssuanceSchema,
} from "@/lib/schemas/domain/coupon.schema";

// ─── 쿠폰 ─────────────────────────────────────────────────────────────────────

/** 가게별 쿠폰 목록 조회 */
export const fetchCouponsByStore = withAction(
  fetchCouponsByStoreSchema,
  async (input) => {
    const supabase = createAdminClient();
    return new CouponRepository(supabase).findByStoreId(input.store_id);
  },
  { action: "READ", resource: "COUPON" }
);

/** 쿠폰 생성 */
export const createCoupon = withAction(
  createCouponSchema,
  async (input) => {
    const supabase = createAdminClient();
    return new CouponRepository(supabase).create(input);
  },
  { action: "CREATE", resource: "COUPON" }
);

/** 쿠폰 수정 */
export const updateCoupon = withAction(
  updateCouponSchema,
  async ({ coupon_id, ...rest }) => {
    const supabase = createAdminClient();
    return new CouponRepository(supabase).update(coupon_id, {
      ...rest,
      modified_at: new Date().toISOString(),
    });
  },
  { action: "UPDATE", resource: "COUPON" }
);

/** 쿠폰 소프트 삭제 (status = CANCELLED) */
export const softDeleteCoupon = withAction(
  softDeleteCouponSchema,
  async (input) => {
    const supabase = createAdminClient();
    return new CouponRepository(supabase).softDelete(input.coupon_id);
  },
  { action: "DELETE", resource: "COUPON" }
);

/** 쿠폰 선택 시 탭 데이터 일괄 조회 (발급·사용) */
export const fetchCouponTabs = withAction(
  fetchCouponTabsSchema,
  async (input) => {
    const supabase = createAdminClient();
    const [issuances, redemptions] = await Promise.all([
      new CouponIssuanceRepository(supabase).findByCouponId(input.coupon_id),
      new CouponRedemptionRepository(supabase).findByCouponId(input.coupon_id),
    ]);
    return { issuances, redemptions };
  },
  { action: "READ", resource: "COUPON_TABS" }
);

// ─── 쿠폰 발급 ────────────────────────────────────────────────────────────────

/** 쿠폰 발급 */
export const issueCoupon = withAction(
  issueCouponSchema,
  async ({ coupon_id, customer_id, expires_at }) => {
    const supabase = createAdminClient();
    return new CouponIssuanceRepository(supabase).create({
      coupon_id,
      customer_id: customer_id ?? null,
      issued_status: "ISSUED",
      expires_at: expires_at ?? null,
    });
  },
  { action: "CREATE", resource: "COUPON_ISSUANCE" }
);

/** 발급 취소 */
export const cancelIssuance = withAction(
  cancelIssuanceSchema,
  async (input) => {
    const supabase = createAdminClient();
    return new CouponIssuanceRepository(supabase).cancelIssuance(input.issuance_id);
  },
  { action: "UPDATE", resource: "COUPON_ISSUANCE" }
);
