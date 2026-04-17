// F008: 배송관리 통합 화면 (배송요청/출발/완료)
export const dynamic = "force-dynamic";

import { PageTitleBar } from "@/components/contents/page-title-bar";
import { DeliveryClient } from "@/app/(admin)/shipments/requests/delivery-client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SellerRepository } from "@/lib/repositories/seller.repository";
import { ShipmentRepository } from "@/lib/repositories/shipment.repository";

export default async function DeliveryManagementPage() {
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  const adminSupabase = createAdminClient();

  // 로그인 seller의 소속 가게 목록 조회
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

  // 오늘 날짜 기준 초기 데이터 조회 (첫 번째 가게)
  const today = new Date().toISOString().split("T")[0];
  const firstStoreId = stores[0]?.store_id;
  const shipmentRepo = new ShipmentRepository(adminSupabase);

  const [initialShipments, initialBbqGroups] = firstStoreId
    ? await Promise.all([
        shipmentRepo.findByStoreAndDateRange(firstStoreId, today, today),
        shipmentRepo.findBbqGroupedByAddress(firstStoreId, today, today),
      ])
    : [[], []];

  return (
    <div className="flex h-full flex-col">
      <PageTitleBar
        title="배송관리"
        screenNumber="40005"
        breadcrumbs={[{ label: "주문배송" }, { label: "배송관리" }]}
      />
      <DeliveryClient
        stores={stores}
        initialShipments={initialShipments}
        initialBbqGroups={initialBbqGroups}
        initialFrom={today}
        initialTo={today}
      />
    </div>
  );
}
