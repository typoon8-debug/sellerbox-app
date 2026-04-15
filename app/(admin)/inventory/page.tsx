// F002: 등록상품 재고관리
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function InventoryPage() {
  return (
    <div>
      <PageTitleBar
        title="등록상품 재고관리"
        screenNumber="21001"
        breadcrumbs={[{ label: "재고 관리" }, { label: "등록상품 재고관리" }]}
      />
      <div className="p-6">{/* TODO: 재고 목록 + 조정 다이얼로그 + 트랜잭션 이력 (Phase 2) */}</div>
    </div>
  );
}
