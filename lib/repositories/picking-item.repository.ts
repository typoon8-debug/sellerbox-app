import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class PickingItemRepository extends BaseRepository<"picking_item"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "picking_item", "picking_item_id", "picking_item_id");
  }
}
