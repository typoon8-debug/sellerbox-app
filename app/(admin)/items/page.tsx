// F001: 상품 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function ItemsPage() {
  return (
    <div>
      <PageTitleBar
        title="상품 관리"
        screenNumber="11001"
        breadcrumbs={[{ label: "상품 관리" }, { label: "상품 조회/목록" }]}
      />
      <div className="p-6">{/* TODO: 상품 목록 + 카테고리 필터 + 등록/수정/삭제 (Phase 2) */}</div>
    </div>
  );
}
