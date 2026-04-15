// F007: 배송 요청 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { RequestsClient } from "@/app/(admin)/shipments/requests/requests-client";

export default function ShipmentsRequestsPage() {
  return (
    <div>
      <PageTitleBar
        title="배송 요청 관리"
        screenNumber="41001"
        breadcrumbs={[{ label: "배송 관리" }, { label: "배송 요청 관리" }]}
      />
      <RequestsClient />
    </div>
  );
}
