// F018: 광고 콘텐츠
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { AdsContentsClient } from "@/app/(admin)/ads/contents/ads-contents-client";

export default function AdsContentsPage() {
  return (
    <div>
      <PageTitleBar
        title="광고 콘텐츠"
        screenNumber="70001"
        breadcrumbs={[{ label: "광고 관리" }, { label: "광고 콘텐츠" }]}
      />
      <AdsContentsClient />
    </div>
  );
}
