import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class StoreFulfillmentRepository extends BaseRepository<"store_fulfillment"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "store_fulfillment", "id", "created_at");
  }
}
