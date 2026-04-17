import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class AdContentRepository extends BaseRepository<"ad_content"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "ad_content", "content_id", "created_at");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected override applySearch(query: any, search: string): any {
    return query.or(`title.ilike.%${search}%`);
  }

  /** 가게 ID 기준 광고 콘텐츠 목록 조회 */
  async findByStoreId(storeId: string) {
    const { data, error } = await this.client
      .from("ad_content")
      .select("*")
      .eq("store_id", storeId)
      .neq("status", "ENDED")
      .order("priority", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  /** 소프트 삭제 (status = ENDED) */
  async softDelete(contentId: string) {
    const { data, error } = await this.client
      .from("ad_content")
      .update({ status: "ENDED", updated_at: new Date().toISOString() })
      .eq("content_id", contentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
