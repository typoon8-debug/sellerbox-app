// F020: 광고 타겟
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { AdsTargetsClient } from "@/app/(admin)/ads/targets/ads-targets-client";

export default function AdsTargetsPage() {
  return (
    <div>
      <PageTitleBar
        title="광고 타겟"
        screenNumber="70003"
        breadcrumbs={[{ label: "광고 관리" }, { label: "광고 타겟" }]}
      />
      <AdsTargetsClient />
    </div>
  );
}
