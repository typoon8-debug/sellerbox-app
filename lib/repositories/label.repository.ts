import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class LabelRepository extends BaseRepository<"label"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "label", "label_id", "label_id");
  }
}
