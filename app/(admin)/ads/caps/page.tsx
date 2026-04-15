// F021: 광고 한도
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { AdsCapsClient } from "@/app/(admin)/ads/caps/ads-caps-client";

export default function AdsCapsPage() {
  return (
    <div>
      <PageTitleBar
        title="광고 한도"
        screenNumber="70004"
        breadcrumbs={[{ label: "광고 관리" }, { label: "광고 한도" }]}
      />
      <AdsCapsClient />
    </div>
  );
}
