// F003: 피킹 작업 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function OrdersPickingPage() {
  return (
    <div>
      <PageTitleBar
        title="피킹 작업 관리"
        screenNumber="31001"
        breadcrumbs={[{ label: "주문 처리" }, { label: "피킹 작업 관리" }]}
      />
      <div className="p-6">{/* TODO: 피킹 대상 주문 목록 + 피킹 상세 (Phase 2) */}</div>
    </div>
  );
}
