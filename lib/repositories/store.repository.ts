import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

type StoreRow = Database["public"]["Tables"]["store"]["Row"];

export class StoreRepository extends BaseRepository<"store"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "store", "store_id", "created_at");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected override applySearch(query: any, search: string): any {
    return query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
  }

  /** 특정 테넌트에 속한 가게 목록 조회 */
  async findByTenantId(tenantId: string): Promise<StoreRow[]> {
    const { data, error } = await this.client
      .from("store")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as StoreRow[];
  }
}
