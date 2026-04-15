import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class ShipmentEventRepository extends BaseRepository<"shipment_event"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "shipment_event", "event_id", "created_at");
  }
}
