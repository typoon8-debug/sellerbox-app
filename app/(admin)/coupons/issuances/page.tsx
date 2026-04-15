// F017: 쿠폰 발급 조회
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function CouponsIssuancesPage() {
  return (
    <div>
      <PageTitleBar
        title="쿠폰 발급 조회"
        screenNumber="60002"
        breadcrumbs={[{ label: "쿠폰 관리" }, { label: "쿠폰 발급 조회" }]}
      />
      <div className="p-6">{/* TODO: 쿠폰 발급/사용 조회 목록 (Phase 2) */}</div>
    </div>
  );
}
