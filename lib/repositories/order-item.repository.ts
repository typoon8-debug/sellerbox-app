import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class OrderItemRepository extends BaseRepository<"order_item"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "order_item", "order_detail_id", "created_at");
  }
}
