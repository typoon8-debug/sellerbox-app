import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

export class CouponRedemptionRepository extends BaseRepository<"coupon_redemption"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "coupon_redemption", "redemption_id", "created_at");
  }
}
