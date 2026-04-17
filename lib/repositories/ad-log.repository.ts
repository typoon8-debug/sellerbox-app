import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class AdLogRepository extends BaseRepository<"ad_log"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "ad_log", "log_id", "ts");
  }

  /** 콘텐츠 ID + 기간 + 액션 필터 로그 조회 (읽기 전용) */
  async findByContentId(contentId: string, opts?: { from?: string; to?: string; action?: string }) {
    let query = this.client
      .from("ad_log")
      .select("*")
      .eq("content_id", contentId)
      .order("ts", { ascending: false })
      .limit(200);

    if (opts?.from) query = query.gte("ts", opts.from);
    if (opts?.to) query = query.lte("ts", opts.to);
    if (opts?.action) query = query.eq("action", opts.action as "IMPRESSION" | "CLICK");

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }
}
