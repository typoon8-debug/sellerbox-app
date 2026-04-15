import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class AdTargetRepository extends BaseRepository<"fp_ad_target"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "fp_ad_target", "target_id", "target_id");
  }
}
