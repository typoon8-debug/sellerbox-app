// F001: 상품 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { ItemsClient } from "@/app/(admin)/items/items-client";

export default function ItemsPage() {
  return (
    <div>
      <PageTitleBar
        title="상품 관리"
        screenNumber="11001"
        breadcrumbs={[{ label: "상품 관리" }, { label: "상품 조회/목록" }]}
      />
      <ItemsClient />
    </div>
  );
}
