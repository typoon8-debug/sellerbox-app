// F020: 광고 타겟
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function AdsTargetsPage() {
  return (
    <div>
      <PageTitleBar
        title="광고 타겟"
        screenNumber="70003"
        breadcrumbs={[{ label: "광고 관리" }, { label: "광고 타겟" }]}
      />
      <div className="p-6">{/* TODO: OS/버전/지역/세그먼트 타겟 폼 (Phase 2) */}</div>
    </div>
  );
}
