// F007: 배송 요청 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function ShipmentsRequestsPage() {
  return (
    <div>
      <PageTitleBar
        title="배송 요청 관리"
        screenNumber="41001"
        breadcrumbs={[{ label: "배송 관리" }, { label: "배송 요청 관리" }]}
      />
      <div className="p-6">{/* TODO: 배송 요청 생성 목록 (Phase 2) */}</div>
    </div>
  );
}
