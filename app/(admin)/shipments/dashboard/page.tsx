// F010: 배송 현황판
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { DashboardClient } from "@/app/(admin)/shipments/dashboard/dashboard-client";

export default function ShipmentsDashboardPage() {
  return (
    <div>
      <PageTitleBar
        title="배송 현황판"
        screenNumber="41004"
        breadcrumbs={[{ label: "배송 관리" }, { label: "배송 현황판" }]}
      />
      <DashboardClient />
    </div>
  );
}
