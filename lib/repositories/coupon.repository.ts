import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class CouponRepository extends BaseRepository<"coupon"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "coupon", "coupon_id", "created_at");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected override applySearch(query: any, search: string): any {
    return query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
  }

  /** 가게별 쿠폰 목록 조회 (CANCELLED 제외) */
  async findByStoreId(storeId: string) {
    const { data, error } = await this.client
      .from("coupon")
      .select("*")
      .eq("store_id", storeId)
      .neq("status", "CANCELLED")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  /** 소프트 삭제 (status = CANCELLED) */
  async softDelete(couponId: string) {
    const { data, error } = await this.client
      .from("coupon")
      .update({ status: "CANCELLED", modified_at: new Date().toISOString() })
      .eq("coupon_id", couponId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
