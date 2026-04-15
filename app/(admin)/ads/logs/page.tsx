// F022: 광고 로그
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { AdsLogsClient } from "@/app/(admin)/ads/logs/ads-logs-client";

export default function AdsLogsPage() {
  return (
    <div>
      <PageTitleBar
        title="광고 로그"
        screenNumber="70005"
        breadcrumbs={[{ label: "광고 관리" }, { label: "광고 로그" }]}
      />
      <AdsLogsClient />
    </div>
  );
}
