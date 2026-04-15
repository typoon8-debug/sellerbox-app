// F006: 피킹/패킹 리스트 출력
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function OrdersPrintPage() {
  return (
    <div>
      <PageTitleBar
        title="피킹/패킹 리스트 출력"
        screenNumber="31004"
        breadcrumbs={[{ label: "주문 처리" }, { label: "피킹/패킹 리스트 출력" }]}
      />
      <div className="p-6">{/* TODO: 피킹/패킹 리스트 PDF 출력 뷰 (Phase 2) */}</div>
    </div>
  );
}
