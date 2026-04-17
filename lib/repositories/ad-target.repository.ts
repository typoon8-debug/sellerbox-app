import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class AdTargetRepository extends BaseRepository<"ad_target"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "ad_target", "target_id", "target_id");
  }

  /** 콘텐츠 ID 기준 타겟 목록 조회 */
  async findByContentId(contentId: string) {
    const { data, error } = await this.client
      .from("ad_target")
      .select("*")
      .eq("content_id", contentId)
      .order("target_id", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }
}
