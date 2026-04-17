// F024: 리뷰관리 화면
export const dynamic = "force-dynamic";

import { PageTitleBar } from "@/components/contents/page-title-bar";
import { ReviewsClient } from "@/app/(admin)/support/reviews/reviews-client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SellerRepository } from "@/lib/repositories/seller.repository";
import { ReviewRepository } from "@/lib/repositories/review.repository";
import type { ReviewWithJoins } from "@/lib/types/domain/support";

export default async function SupportReviewsPage() {
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  const adminSupabase = createAdminClient();

  // 로그인 seller의 소속 가게 목록 조회
  let stores: { store_id: string; name: string }[] = [];
  if (user?.email) {
    const sellerRepo = new SellerRepository(adminSupabase);
    const sellers = await sellerRepo.findByEmail(user.email);
    const storeIds = [...new Set(sellers.map((s) => s.store_id).filter(Boolean))] as string[];

    if (storeIds.length > 0) {
      const { data: storeRows } = await adminSupabase
        .from("store")
        .select("store_id, name")
        .in("store_id", storeIds)
        .order("name", { ascending: true });
      stores = (storeRows ?? []) as { store_id: string; name: string }[];
    }
  }

  // 오늘 기준 초기 리뷰 조회 (첫 번째 가게)
  const today = new Date().toISOString().split("T")[0];
  const firstStoreId = stores[0]?.store_id;
  const reviewRepo = new ReviewRepository(adminSupabase);

  let initialReviews: ReviewWithJoins[] = [];
  if (firstStoreId) {
    try {
      initialReviews = await reviewRepo.findByStoreAndDateRange(firstStoreId, today, today, {
        status: "ALL",
      });
    } catch {
      // DB 연결 실패 시 빈 결과
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageTitleBar
        title="리뷰관리"
        screenNumber="50002"
        breadcrumbs={[{ label: "고객지원" }, { label: "리뷰관리" }]}
      />
      <ReviewsClient
        stores={stores}
        initialReviews={initialReviews}
        initialFrom={today}
        initialTo={today}
      />
    </div>
  );
}
