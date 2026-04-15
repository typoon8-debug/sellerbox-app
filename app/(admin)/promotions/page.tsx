// F014: 프로모션 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { PromotionsClient } from "@/app/(admin)/promotions/promotions-client";

export default function PromotionsPage() {
  return (
    <div>
      <PageTitleBar
        title="프로모션 관리"
        screenNumber="50001"
        breadcrumbs={[{ label: "프로모션" }, { label: "프로모션 관리" }]}
      />
      <PromotionsClient />
    </div>
  );
}
