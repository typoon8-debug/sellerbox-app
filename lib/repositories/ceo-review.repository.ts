import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";
import type { CeoReviewRow } from "@/lib/types/domain/support";

export class CeoReviewRepository extends BaseRepository<"ceo_review"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "ceo_review", "ceo_reviewId", "created_at");
  }

  async findByReviewIds(reviewIds: string[]): Promise<CeoReviewRow[]> {
    if (reviewIds.length === 0) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from("ceo_review")
      .select("*")
      .in("reviewId", reviewIds);
    if (error) throw new Error(error.message);
    return (data ?? []) as CeoReviewRow[];
  }
}
