import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class DispatchRequestRepository extends BaseRepository<"dispatch_request"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "dispatch_request", "dispatch_id", "requested_at");
  }
}
