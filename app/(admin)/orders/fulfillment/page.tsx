// F003~F007 통합: 주문처리 (피킹→패킹→라벨링→배송요청)
// 실시간 주문 처리 화면이므로 캐시 없이 매번 렌더링
export const dynamic = "force-dynamic";

import { PageTitleBar } from "@/components/contents/page-title-bar";
import { FulfillmentClient } from "@/app/(admin)/orders/fulfillment/fulfillment-client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SellerRepository } from "@/lib/repositories/seller.repository";
import { OrderRepository } from "@/lib/repositories/order.repository";

export default async function OrderFulfillmentPage() {
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

  // 초기 대시보드 통계 조회 (첫 번째 가게, 오늘 날짜 기준)
  const today = new Date().toISOString().split("T")[0];
  const firstStoreId = stores[0]?.store_id;

  const orderRepo = new OrderRepository(adminSupabase);
  const initialStats = firstStoreId
    ? await orderRepo.getStats(firstStoreId, today)
    : {
        todayOrderCount: 0,
        pickingPendingCount: 0,
        packingPendingCount: 0,
        dispatchedCount: 0,
      };

  return (
    <div className="flex h-full flex-col">
      <PageTitleBar
        title="주문처리 (피킹/패킹/라벨/배송)"
        screenNumber="31010"
        breadcrumbs={[{ label: "주문 처리" }, { label: "주문처리" }]}
      />
      <FulfillmentClient stores={stores} initialStats={initialStats} today={today} />
    </div>
  );
}
