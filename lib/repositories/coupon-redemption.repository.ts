import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class CouponRedemptionRepository extends BaseRepository<"coupon_redemption"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "coupon_redemption", "redemption_id", "created_at");
  }

  /** 쿠폰 ID 기준 사용 이력 조회 (issuance 경유) */
  async findByCouponId(couponId: string) {
    const { data: issuances, error: iErr } = await this.client
      .from("coupon_issurance")
      .select("issuance_id")
      .eq("coupon_id", couponId);
    if (iErr) throw iErr;

    const ids = (issuances ?? []).map((i) => i.issuance_id);
    if (ids.length === 0) return [];

    const { data, error } = await this.client
      .from("coupon_redemption")
      .select("*")
      .in("issuance_id", ids)
      .order("used_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
}
