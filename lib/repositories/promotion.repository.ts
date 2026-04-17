import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class PromotionRepository extends BaseRepository<"promotion"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "promotion", "promo_id", "created_at");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected override applySearch(query: any, search: string): any {
    return query.or(`name.ilike.%${search}%`);
  }

  /** 가게별 프로모션 목록 조회 (ENDED 제외) */
  async findByStoreId(storeId: string) {
    const { data, error } = await this.client
      .from("promotion")
      .select("*")
      .eq("store_id", storeId)
      .neq("status", "ENDED")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  /** 소프트 삭제 (status = ENDED) */
  async softDelete(promoId: string) {
    const { data, error } = await this.client
      .from("promotion")
      .update({ status: "ENDED", updated_at: new Date().toISOString() })
      .eq("promo_id", promoId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
