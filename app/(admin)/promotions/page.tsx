// F014: 프로모션 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function PromotionsPage() {
  return (
    <div>
      <PageTitleBar
        title="프로모션 관리"
        screenNumber="50001"
        breadcrumbs={[{ label: "프로모션" }, { label: "프로모션 관리" }]}
      />
      <div className="p-6">{/* TODO: 프로모션 목록 + 등록/수정/삭제 (Phase 2) */}</div>
    </div>
  );
}
