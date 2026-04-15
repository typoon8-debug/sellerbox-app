// F005: 라벨 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function OrdersLabelsPage() {
  return (
    <div>
      <PageTitleBar
        title="라벨 관리"
        screenNumber="31003"
        breadcrumbs={[{ label: "주문 처리" }, { label: "라벨 관리" }]}
      />
      <div className="p-6">{/* TODO: 라벨 출력 대상 선택 + ZPL 미리보기 (Phase 2) */}</div>
    </div>
  );
}
