// F002: 등록상품 재고관리
// 재고 데이터는 실시간성이 중요하므로 캐시 없이 렌더링
export const dynamic = "force-dynamic";

import { PageTitleBar } from "@/components/contents/page-title-bar";
import { InventoryMgmtClient } from "@/app/(admin)/inventory/inventory-mgmt-client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SellerRepository } from "@/lib/repositories/seller.repository";

export default async function InventoryPage() {
  // 세션 기반 로그인 사용자 email 조회
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  const adminSupabase = createAdminClient();

  // 로그인한 seller의 소속 가게 목록 조회 (OWNER는 복수 가게 운영 가능)
  let stores: { store_id: string; name: string }[] = [];
  if (user?.email) {
    const sellerRepo = new SellerRepository(adminSupabase);
    const sellers = await sellerRepo.findByEmail(user.email);
    const storeIds = [...new Set(sellers.map((s) => s.store_id).filter(Boolean))] as string[];

    if (storeIds.length > 0) {
      const { data: storeRows } = await adminSupabase
        .from("store")
        .select("store_id, name")
        .in("store_id", storeIds)
        .order("name", { ascending: true });
      stores = (storeRows ?? []) as { store_id: string; name: string }[];
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageTitleBar
        title="등록상품 재고관리"
        screenNumber="21001"
        breadcrumbs={[{ label: "재고 관리" }, { label: "등록상품 재고관리" }]}
      />
      <InventoryMgmtClient stores={stores} />
    </div>
  );
}
