// F023: CS 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function SupportCsPage() {
  return (
    <div>
      <PageTitleBar
        title="CS 관리"
        screenNumber="80001"
        breadcrumbs={[{ label: "고객 지원" }, { label: "CS 관리" }]}
      />
      <div className="p-6">{/* TODO: CS 티켓 목록 + 상세(내용/처리결과 입력) (Phase 2) */}</div>
    </div>
  );
}
