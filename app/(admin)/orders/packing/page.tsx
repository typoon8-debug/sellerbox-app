// F004: 패킹 작업 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { PackingClient } from "@/app/(admin)/orders/packing/packing-client";

export default function OrdersPackingPage() {
  return (
    <div>
      <PageTitleBar
        title="패킹 작업 관리"
        screenNumber="31002"
        breadcrumbs={[{ label: "주문 처리" }, { label: "패킹 작업 관리" }]}
      />
      <PackingClient />
    </div>
  );
}
