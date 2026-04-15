import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class AdLogRepository extends BaseRepository<"fp_ad_log"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "fp_ad_log", "log_id", "ts");
  }
}
