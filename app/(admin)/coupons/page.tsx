// F016: 쿠폰 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { CouponsClient } from "@/app/(admin)/coupons/coupons-client";

export default function CouponsPage() {
  return (
    <div>
      <PageTitleBar
        title="쿠폰 관리"
        screenNumber="60001"
        breadcrumbs={[{ label: "쿠폰 관리" }, { label: "쿠폰 관리" }]}
      />
      <CouponsClient />
    </div>
  );
}
