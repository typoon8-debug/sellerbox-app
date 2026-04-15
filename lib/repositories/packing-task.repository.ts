import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class PackingTaskRepository extends BaseRepository<"packing_task"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "packing_task", "pack_id", "pack_id");
  }
}
