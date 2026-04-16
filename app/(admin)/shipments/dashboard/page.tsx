// F010: 배송 현황판
// 실시간 배송 데이터 → 캐시 없이 렌더링 (revalidate 불필요, Realtime 구독으로 갱신)
export const revalidate = 0;

import { PageTitleBar } from "@/components/contents/page-title-bar";
import { DashboardClient } from "@/app/(admin)/shipments/dashboard/dashboard-client";
import { createClient } from "@/lib/supabase/server";
import { ShipmentRepository } from "@/lib/repositories/shipment.repository";
import { ShipmentEventRepository } from "@/lib/repositories/shipment-event.repository";

export interface DashboardStats {
  /** 총 주문 건수 */
  totalOrders: number;
  /** 배송 완료 건수 */
  delivered: number;
  /** 피킹/패킹 건수 */
  inFulfillment: number;
  /** 배송 중 건수 */
  inDelivery: number;
}

export default async function ShipmentsDashboardPage() {
  // 서버 컴포넌트에서 Supabase 클라이언트 생성
  const supabase = await createClient();
  const shipmentRepo = new ShipmentRepository(supabase);

  // 초기 카드 4종 DB 조회
  const [allResult, deliveredResult, assignedResult, inDeliveryResult] = await Promise.all([
    // 총 주문 건수
    shipmentRepo.paginate({ page: 1, pageSize: 1 }),
    // 배송 완료
    shipmentRepo.paginate({ page: 1, pageSize: 1, filters: { status: "DELIVERED" } }),
    // 피킹/패킹 (READY 상태)
    shipmentRepo.paginate({ page: 1, pageSize: 1, filters: { status: "READY" } }),
    // 배송 중
    shipmentRepo.paginate({ page: 1, pageSize: 1, filters: { status: "OUT_FOR_DELIVERY" } }),
  ]);

  const stats: DashboardStats = {
    totalOrders: allResult.totalCount,
    delivered: deliveredResult.totalCount,
    inFulfillment: assignedResult.totalCount,
    inDelivery: inDeliveryResult.totalCount,
  };

  // 최근 배송 이벤트 조회
  const shipmentEventRepo = new ShipmentEventRepository(supabase);
  const eventsResult = await shipmentEventRepo.paginate({
    page: 1,
    pageSize: 20,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  return (
    <div>
      <PageTitleBar
        title="배송현황판"
        screenNumber="10001"
        breadcrumbs={[{ label: "메인" }, { label: "배송현황판" }]}
      />
      <DashboardClient initialStats={stats} initialEvents={eventsResult.data} />
    </div>
  );
}
