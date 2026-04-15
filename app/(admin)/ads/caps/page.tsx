// F021: 광고 한도
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function AdsCapsPage() {
  return (
    <div>
      <PageTitleBar
        title="광고 한도"
        screenNumber="70004"
        breadcrumbs={[{ label: "광고 관리" }, { label: "광고 한도" }]}
      />
      <div className="p-6">{/* TODO: 노출/클릭 한도 폼 (Phase 2) */}</div>
    </div>
  );
}
