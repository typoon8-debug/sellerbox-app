// F010: 배송 현황판
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function ShipmentsDashboardPage() {
  return (
    <div>
      <PageTitleBar
        title="배송 현황판"
        screenNumber="41004"
        breadcrumbs={[{ label: "배송 관리" }, { label: "배송 현황판" }]}
      />
      <div className="p-6">
        {/* TODO: 현황 카드 4종 + 배송이벤트 타임라인 + Realtime (Phase 2) */}
      </div>
    </div>
  );
}
