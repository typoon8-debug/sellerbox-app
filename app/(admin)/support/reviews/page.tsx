// F024: 리뷰 관리 - Server Component (실제 Supabase 연동)
import { createClient } from "@/lib/supabase/server";
import { ReviewRepository } from "@/lib/repositories/review.repository";
import { CeoReviewRepository } from "@/lib/repositories/ceo-review.repository";
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { ReviewsClient } from "@/app/(admin)/support/reviews/reviews-client";
import type { ReviewRow, CeoReviewRow } from "@/lib/types/domain/support";
import type { PaginatedResult } from "@/lib/types/api";

interface SearchParams {
  status?: string;
  page?: string;
}

export interface ReviewWithCeo extends ReviewRow {
  ceoReview: CeoReviewRow | null;
}

export default async function SupportReviewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // 필터 구성
  const filters: Record<string, string> = {};
  if (params.status && params.status !== "ALL") filters.status = params.status;

  const page = params.page ? parseInt(params.page, 10) : 1;

  let reviewResult: PaginatedResult<ReviewRow>;
  let ceoReviews: CeoReviewRow[] = [];

  try {
    const reviewRepo = new ReviewRepository(supabase);
    reviewResult = await reviewRepo.paginate({ page, pageSize: 20, filters });

    // 해당 페이지의 review_id 목록으로 ceo_review 조회
    if (reviewResult.data.length > 0) {
      const reviewIds = reviewResult.data.map((r) => r.review_id);
      const ceoReviewRepo = new CeoReviewRepository(supabase);
      const allCeoReviews = await ceoReviewRepo.findAll();
      ceoReviews = allCeoReviews.filter((cr) => reviewIds.includes(cr.reviewId));
    }
  } catch {
    // DB 연결 실패 시 빈 결과 반환
    reviewResult = { data: [], totalCount: 0, hasNextPage: false, page: 1, pageSize: 20 };
  }

  // review + ceo_review 조합
  const reviewsWithCeo: ReviewWithCeo[] = reviewResult.data.map((review) => ({
    ...review,
    ceoReview: ceoReviews.find((cr) => cr.reviewId === review.review_id) ?? null,
  }));

  const initialData: PaginatedResult<ReviewWithCeo> = {
    ...reviewResult,
    data: reviewsWithCeo,
  };

  return (
    <div>
      <PageTitleBar
        title="리뷰 관리"
        screenNumber="80002"
        breadcrumbs={[{ label: "고객 지원" }, { label: "리뷰 관리" }]}
      />
      <ReviewsClient initialData={initialData} initialStatus={params.status ?? "ALL"} />
    </div>
  );
}
