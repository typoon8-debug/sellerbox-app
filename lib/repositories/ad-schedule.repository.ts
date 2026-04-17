import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class AdScheduleRepository extends BaseRepository<"ad_schedule"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "ad_schedule", "schedule_id", "start_at");
  }

  /** 콘텐츠 ID 기준 일정 목록 조회 */
  async findByContentId(contentId: string) {
    const { data, error } = await this.client
      .from("ad_schedule")
      .select("*")
      .eq("content_id", contentId)
      .order("start_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }
}
