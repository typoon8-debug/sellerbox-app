import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class PromotionItemRepository extends BaseRepository<"promotion_item"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "promotion_item", "id", "created_at");
  }
}
