// F005: 라벨 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { LabelsClient } from "@/app/(admin)/orders/labels/labels-client";

export default function OrdersLabelsPage() {
  return (
    <div>
      <PageTitleBar
        title="라벨 관리"
        screenNumber="31003"
        breadcrumbs={[{ label: "주문 처리" }, { label: "라벨 관리" }]}
      />
      <LabelsClient />
    </div>
  );
}
