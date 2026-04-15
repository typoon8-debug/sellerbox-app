import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class AdContentRepository extends BaseRepository<"fp_ad_content"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "fp_ad_content", "content_id", "created_at");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected override applySearch(query: any, search: string): any {
    return query.or(`title.ilike.%${search}%`);
  }
}
