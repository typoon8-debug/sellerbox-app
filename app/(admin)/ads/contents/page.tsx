// F018: 광고 콘텐츠
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function AdsContentsPage() {
  return (
    <div>
      <PageTitleBar
        title="광고 콘텐츠"
        screenNumber="70001"
        breadcrumbs={[{ label: "광고 관리" }, { label: "광고 콘텐츠" }]}
      />
      <div className="p-6">{/* TODO: 광고 콘텐츠 등록 (이미지 업로더 재사용) (Phase 2) */}</div>
    </div>
  );
}
