import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class AdCapRepository extends BaseRepository<"fp_ad_cap"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "fp_ad_cap", "cap_id", "created_at");
  }
}
