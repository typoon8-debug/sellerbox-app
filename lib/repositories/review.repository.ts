import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class ReviewRepository extends BaseRepository<"review"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "review", "review_id", "created_at");
  }
}
