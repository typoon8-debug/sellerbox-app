// F012: 가게 조회/목록
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function StoresPage() {
  return (
    <div>
      <PageTitleBar
        title="가게 관리"
        screenNumber="12001"
        breadcrumbs={[{ label: "가게 관리" }, { label: "가게 조회/목록" }]}
      />
      <div className="p-6">{/* TODO: 가게 목록 테이블 (Phase 2) */}</div>
    </div>
  );
}
