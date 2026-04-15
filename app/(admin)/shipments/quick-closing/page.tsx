// F008: 바로퀵 마감
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { QuickClosingClient } from "@/app/(admin)/shipments/quick-closing/quick-closing-client";

export default function ShipmentsQuickClosingPage() {
  return (
    <div>
      <PageTitleBar
        title="바로퀵 마감"
        screenNumber="41002"
        breadcrumbs={[{ label: "배송 관리" }, { label: "바로퀵 마감" }]}
      />
      <QuickClosingClient />
    </div>
  );
}
