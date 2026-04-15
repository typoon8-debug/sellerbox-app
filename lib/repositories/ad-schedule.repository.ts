import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class AdScheduleRepository extends BaseRepository<"fp_ad_schedule"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "fp_ad_schedule", "schedule_id", "start_at");
  }
}
