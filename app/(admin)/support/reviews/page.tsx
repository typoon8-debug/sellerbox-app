// F024: 리뷰 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function SupportReviewsPage() {
  return (
    <div>
      <PageTitleBar
        title="리뷰 관리"
        screenNumber="80002"
        breadcrumbs={[{ label: "고객 지원" }, { label: "리뷰 관리" }]}
      />
      <div className="p-6">{/* TODO: 리뷰 목록 + CEO 답변 폼 (Phase 2) */}</div>
    </div>
  );
}
