import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class PromotionItemRepository extends BaseRepository<"promotion_item"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "promotion_item", "id", "created_at");
  }

  /** 프로모션별 상품 목록 조회 (INACTIVE 제외) */
  async findByPromoId(promoId: string) {
    const { data, error } = await this.client
      .from("promotion_item")
      .select("*")
      .eq("promo_id", promoId)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  /** 소프트 삭제 (status = INACTIVE) */
  async softDelete(id: string) {
    const { data, error } = await this.client
      .from("promotion_item")
      .update({ status: "INACTIVE", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
