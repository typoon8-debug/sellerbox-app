// F017: 쿠폰 발급 조회
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { IssuancesClient } from "@/app/(admin)/coupons/issuances/issuances-client";

export default function CouponsIssuancesPage() {
  return (
    <div>
      <PageTitleBar
        title="쿠폰 발급 조회"
        screenNumber="60002"
        breadcrumbs={[{ label: "쿠폰 관리" }, { label: "쿠폰 발급 조회" }]}
      />
      <IssuancesClient />
    </div>
  );
}
