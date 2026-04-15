// F015: 프로모션 상품 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { PromotionItemsClient } from "@/app/(admin)/promotions/items/promotion-items-client";

export default function PromotionsItemsPage() {
  return (
    <div>
      <PageTitleBar
        title="프로모션 상품 관리"
        screenNumber="50002"
        breadcrumbs={[{ label: "프로모션" }, { label: "프로모션 상품 관리" }]}
      />
      <PromotionItemsClient />
    </div>
  );
}
