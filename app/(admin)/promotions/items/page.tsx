// F015: 프로모션 상품 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { PromotionItemsClient } from "@/app/(admin)/promotions/items/promotion-items-client";
import { createClient } from "@/lib/supabase/server";
import { PromotionRepository } from "@/lib/repositories/promotion.repository";
import { PromotionItemRepository } from "@/lib/repositories/promotion-item.repository";

export default async function PromotionsItemsPage() {
  // 서버 컴포넌트에서 Supabase 클라이언트 생성
  const supabase = await createClient();

  // 프로모션 드롭다운용 전체 목록 조회
  const promotionRepo = new PromotionRepository(supabase);
  const promotionsResult = await promotionRepo.paginate({ page: 1, pageSize: 100 });

  // 프로모션 아이템 전체 목록 조회
  const itemRepo = new PromotionItemRepository(supabase);
  const itemsResult = await itemRepo.paginate({ page: 1, pageSize: 50 });

  return (
    <div>
      <PageTitleBar
        title="프로모션 상품 관리"
        screenNumber="30005"
        breadcrumbs={[{ label: "상품관리" }, { label: "프로모션 상품 관리" }]}
      />
      <PromotionItemsClient promotions={promotionsResult.data} initialItems={itemsResult.data} />
    </div>
  );
}
