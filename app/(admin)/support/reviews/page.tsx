// F024: 리뷰 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { ReviewsClient } from "@/app/(admin)/support/reviews/reviews-client";

export default function SupportReviewsPage() {
  return (
    <div>
      <PageTitleBar
        title="리뷰 관리"
        screenNumber="80002"
        breadcrumbs={[{ label: "고객 지원" }, { label: "리뷰 관리" }]}
      />
      <ReviewsClient />
    </div>
  );
}
