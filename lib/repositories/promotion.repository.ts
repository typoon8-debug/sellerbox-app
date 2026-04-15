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
}
