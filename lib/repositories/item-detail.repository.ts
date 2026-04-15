import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class ItemDetailRepository extends BaseRepository<"item_detail"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "item_detail", "item_detail_id", "created_at");
  }
}
