// F016: 쿠폰 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function CouponsPage() {
  return (
    <div>
      <PageTitleBar
        title="쿠폰 관리"
        screenNumber="60001"
        breadcrumbs={[{ label: "쿠폰 관리" }, { label: "쿠폰 관리" }]}
      />
      <div className="p-6">{/* TODO: 쿠폰 목록 + 등록/수정/삭제 (Phase 2) */}</div>
    </div>
  );
}
