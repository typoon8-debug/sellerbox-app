import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";
import type { ReviewWithJoins, CeoReviewRow } from "@/lib/types/domain/support";

export class ReviewRepository extends BaseRepository<"review"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "review", "review_id", "created_at");
  }

  async findByStoreAndDateRange(
    storeId: string,
    from: string,
    to: string,
    opts?: {
      status?: "VISIBLE" | "HIDDEN" | "REPORTED" | "DELETED" | "ALL";
    }
  ): Promise<ReviewWithJoins[]> {
    const supabase = this.client;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("review")
      .select("*")
      .eq("store_id", storeId)
      .gte("created_at", `${from}T00:00:00`)
      .lte("created_at", `${to}T23:59:59`)
      .order("created_at", { ascending: false });

    if (opts?.status && opts.status !== "ALL") {
      query = query.eq("status", opts.status);
    }

    const { data: reviews, error } = await query;
    if (error) throw new Error(error.message);
    if (!reviews || reviews.length === 0) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reviewList = reviews as any[];

    // 상품명 조회
    const itemIds = [
      ...new Set(reviewList.filter((r) => r.item_id).map((r) => r.item_id as string)),
    ];
    const itemMap = new Map<string, { item_id: string; name: string }>();
    if (itemIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: items } = await (supabase as any)
        .from("item")
        .select("item_id, name")
        .in("item_id", itemIds);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((items ?? []) as any[]).forEach((i: any) => itemMap.set(i.item_id, i));
    }

    // 회원 정보 조회
    const customerIds = [...new Set(reviewList.map((r) => r.customer_id as string))];
    const customerMap = new Map<string, { user_id: string; email: string }>();
    if (customerIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: customers } = await (supabase as any)
        .from("users")
        .select("user_id, email")
        .in("user_id", customerIds);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((customers ?? []) as any[]).forEach((c: any) => customerMap.set(c.user_id, c));
    }

    // CEO 리뷰 조회
    const reviewIds = reviewList.map((r) => r.review_id as string);
    const ceoReviewMap = new Map<string, CeoReviewRow>();
    if (reviewIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: ceoReviews } = await (supabase as any)
        .from("ceo_review")
        .select("*")
        .in("reviewId", reviewIds);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((ceoReviews ?? []) as any[]).forEach((cr: any) =>
        ceoReviewMap.set(cr.reviewId, cr as CeoReviewRow)
      );
    }

    return reviewList.map((r) => ({
      ...r,
      item: itemMap.get(r.item_id) ?? null,
      customer: customerMap.get(r.customer_id) ?? null,
      ceo_review: ceoReviewMap.get(r.review_id) ?? null,
    })) as ReviewWithJoins[];
  }
}
