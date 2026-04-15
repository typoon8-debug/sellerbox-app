// F008: 바로퀵 마감
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function ShipmentsQuickClosingPage() {
  return (
    <div>
      <PageTitleBar
        title="바로퀵 마감"
        screenNumber="41002"
        breadcrumbs={[{ label: "배송 관리" }, { label: "바로퀵 마감" }]}
      />
      <div className="p-6">{/* TODO: 바로퀵 슬롯별 마감 처리 (Phase 2) */}</div>
    </div>
  );
}
