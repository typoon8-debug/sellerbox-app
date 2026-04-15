// F022: 광고 로그
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function AdsLogsPage() {
  return (
    <div>
      <PageTitleBar
        title="광고 로그"
        screenNumber="70005"
        breadcrumbs={[{ label: "광고 관리" }, { label: "광고 로그" }]}
      />
      <div className="p-6">{/* TODO: 광고 로그 조회 (필터 + 목록) (Phase 2) */}</div>
    </div>
  );
}
