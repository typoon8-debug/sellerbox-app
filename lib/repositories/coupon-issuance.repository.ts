import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class CouponIssuanceRepository extends BaseRepository<"coupon_issurance"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "coupon_issurance", "issuance_id", "created_at");
  }
}
