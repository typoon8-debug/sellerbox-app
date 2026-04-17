import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class AdCapRepository extends BaseRepository<"ad_cap"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "ad_cap", "cap_id", "created_at");
  }

  /** 콘텐츠 ID 기준 한도 목록 조회 */
  async findByContentId(contentId: string) {
    const { data, error } = await this.client
      .from("ad_cap")
      .select("*")
      .eq("content_id", contentId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }
}
