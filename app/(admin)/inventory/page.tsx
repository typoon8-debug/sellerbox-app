// F002: 등록상품 재고관리
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { InventoryClient } from "@/app/(admin)/inventory/inventory-client";

export default function InventoryPage() {
  return (
    <div>
      <PageTitleBar
        title="등록상품 재고관리"
        screenNumber="21001"
        breadcrumbs={[{ label: "재고 관리" }, { label: "등록상품 재고관리" }]}
      />
      <InventoryClient />
    </div>
  );
}
