import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class CsTicketRepository extends BaseRepository<"cs_ticket"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "cs_ticket", "ticket_id", "created_at");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected override applySearch(query: any, search: string): any {
    return query.or(`cs_contents.ilike.%${search}%`);
  }
}
