// F009: 배송 라우팅
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function ShipmentsRoutingPage() {
  return (
    <div>
      <PageTitleBar
        title="배송 라우팅"
        screenNumber="41003"
        breadcrumbs={[{ label: "배송 관리" }, { label: "배송 라우팅" }]}
      />
      <div className="p-6">{/* TODO: 배송 순서 생성 리스트 (Phase 2) */}</div>
    </div>
  );
}
