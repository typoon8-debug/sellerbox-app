import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class StoreQuickTimeslotRepository extends BaseRepository<"store_quick_timeslot"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "store_quick_timeslot", "slot_id", "created_at");
  }
}
