// F019: 광고 일정
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function AdsSchedulesPage() {
  return (
    <div>
      <PageTitleBar
        title="광고 일정"
        screenNumber="70002"
        breadcrumbs={[{ label: "광고 관리" }, { label: "광고 일정" }]}
      />
      <div className="p-6">
        {/* TODO: 광고 일정 (date range · time range · dow mask) (Phase 2) */}
      </div>
    </div>
  );
}
