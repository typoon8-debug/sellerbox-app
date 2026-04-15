import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class StoreQuickSlotUsageRepository extends BaseRepository<"store_quick_slot_usage"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "store_quick_slot_usage", "usage_id", "depart_date");
  }
}
