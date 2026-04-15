import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class StoreQuickPolicyRepository extends BaseRepository<"store_quick_policy"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "store_quick_policy", "policy_id", "created_at");
  }
}
