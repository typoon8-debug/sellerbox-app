// F002: 등록상품 재고관리
// 재고 데이터는 실시간성이 중요하므로 캐시 없이 렌더링
export const revalidate = 0;

import { PageTitleBar } from "@/components/contents/page-title-bar";
import { InventoryClient } from "@/app/(admin)/inventory/inventory-client";
import { createAdminClient } from "@/lib/supabase/admin";
import { InventoryRepository } from "@/lib/repositories/inventory.repository";
import { StoreRepository } from "@/lib/repositories/store.repository";

export default async function InventoryPage() {
  const supabase = createAdminClient();

  // 첫 번째 가게의 store_id 조회 (임시 - 추후 세션 기반 seller store_id로 교체)
  const storeRepo = new StoreRepository(supabase);
  const stores = await storeRepo.findAll({ sortBy: "created_at", sortOrder: "asc" });
  const storeId = stores[0]?.store_id ?? "";

  // 재고 목록을 상품 정보와 함께 조회
  const inventoryRepo = new InventoryRepository(supabase);
  const data = storeId ? await inventoryRepo.findByStoreWithItemJoin(storeId) : [];

  return (
    <div>
      <PageTitleBar
        title="등록상품 재고관리"
        screenNumber="21001"
        breadcrumbs={[{ label: "재고 관리" }, { label: "등록상품 재고관리" }]}
      />
      <InventoryClient initialData={data} />
    </div>
  );
}
