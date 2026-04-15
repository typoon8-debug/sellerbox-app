import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class AuditLogRepository extends BaseRepository<"audit_log"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "audit_log", "id", "created_at");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected override applySearch(query: any, search: string): any {
    return query.or(`resource.ilike.%${search}%,action.ilike.%${search}%`);
  }

  /**
   * 특정 리소스의 감사 로그 조회
   */
  async findByResource(
    resource: string
  ): Promise<Database["public"]["Tables"]["audit_log"]["Row"][]> {
    const { data, error } = await this.client
      .from("audit_log")
      .select("*")
      .eq("resource", resource)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  /**
   * 특정 사용자의 감사 로그 조회
   */
  async findByActor(userId: string): Promise<Database["public"]["Tables"]["audit_log"]["Row"][]> {
    const { data, error } = await this.client
      .from("audit_log")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  }
}
