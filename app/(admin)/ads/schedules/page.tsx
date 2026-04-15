// F019: 광고 일정
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { AdsSchedulesClient } from "@/app/(admin)/ads/schedules/ads-schedules-client";

export default function AdsSchedulesPage() {
  return (
    <div>
      <PageTitleBar
        title="광고 일정"
        screenNumber="70002"
        breadcrumbs={[{ label: "광고 관리" }, { label: "광고 일정" }]}
      />
      <AdsSchedulesClient />
    </div>
  );
}
