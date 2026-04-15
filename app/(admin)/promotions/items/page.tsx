// F015: 프로모션 상품 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function PromotionsItemsPage() {
  return (
    <div>
      <PageTitleBar
        title="프로모션 상품 관리"
        screenNumber="50002"
        breadcrumbs={[{ label: "프로모션" }, { label: "프로모션 상품 관리" }]}
      />
      <div className="p-6">{/* TODO: 프로모션 적용 상품 관리 (Phase 2) */}</div>
    </div>
  );
}
