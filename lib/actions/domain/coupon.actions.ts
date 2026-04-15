"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { CouponRepository } from "@/lib/repositories/coupon.repository";
import { CouponIssuanceRepository } from "@/lib/repositories/coupon-issuance.repository";
import { createCouponSchema, issueCouponSchema } from "@/lib/schemas/domain/coupon.schema";

/** 쿠폰 생성 */
export const createCoupon = withAction(
  createCouponSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new CouponRepository(supabase);
    return repo.create(input);
  },
  { action: "CREATE", resource: "COUPON" }
);

/** 쿠폰 발급 */
export const issueCoupon = withAction(
  issueCouponSchema,
  async ({ coupon_id, customer_id, expires_at }) => {
    const supabase = createAdminClient();
    const repo = new CouponIssuanceRepository(supabase);
    return repo.create({
      coupon_id,
      customer_id: customer_id ?? null,
      issued_status: "ISSUED",
      expires_at: expires_at ?? null,
    });
  },
  { action: "CREATE", resource: "COUPON_ISSUANCE" }
);
