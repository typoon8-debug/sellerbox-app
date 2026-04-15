// F004: 패킹 작업 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function OrdersPackingPage() {
  return (
    <div>
      <PageTitleBar
        title="패킹 작업 관리"
        screenNumber="31002"
        breadcrumbs={[{ label: "주문 처리" }, { label: "패킹 작업 관리" }]}
      />
      <div className="p-6">{/* TODO: 패킹 목록 + 중량 입력 + 완료 처리 (Phase 2) */}</div>
    </div>
  );
}
