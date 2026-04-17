import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class CouponIssuanceRepository extends BaseRepository<"coupon_issurance"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "coupon_issurance", "issuance_id", "created_at");
  }

  /** 쿠폰 ID 기준 발급 목록 조회 */
  async findByCouponId(couponId: string) {
    const { data, error } = await this.client
      .from("coupon_issurance")
      .select("*")
      .eq("coupon_id", couponId)
      .order("issued_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  /** 발급 취소 (issued_status = CANCELLED) */
  async cancelIssuance(issuanceId: string) {
    const { data, error } = await this.client
      .from("coupon_issurance")
      .update({ issued_status: "CANCELLED", modified_at: new Date().toISOString() })
      .eq("issuance_id", issuanceId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
