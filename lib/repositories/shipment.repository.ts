import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class ShipmentRepository extends BaseRepository<"shipment"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "shipment", "shipment_id", "updated_at");
  }
}
