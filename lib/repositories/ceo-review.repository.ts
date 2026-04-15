import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class CeoReviewRepository extends BaseRepository<"ceo_review"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "ceo_review", "ceo_reviewId", "created_at");
  }
}
