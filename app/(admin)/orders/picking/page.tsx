// F003: 피킹 작업 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { PickingClient } from "@/app/(admin)/orders/picking/picking-client";

export default function OrdersPickingPage() {
  return (
    <div>
      <PageTitleBar
        title="피킹 작업 관리"
        screenNumber="31001"
        breadcrumbs={[{ label: "주문 처리" }, { label: "피킹 작업 관리" }]}
      />
      <PickingClient />
    </div>
  );
}
