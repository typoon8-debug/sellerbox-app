// F009: 배송 라우팅
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { RoutingClient } from "@/app/(admin)/shipments/routing/routing-client";

export default function ShipmentsRoutingPage() {
  return (
    <div>
      <PageTitleBar
        title="배송 라우팅"
        screenNumber="41003"
        breadcrumbs={[{ label: "배송 관리" }, { label: "배송 라우팅" }]}
      />
      <RoutingClient />
    </div>
  );
}
