// F009: 배송 라우팅
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { RoutingClient } from "@/app/(admin)/shipments/routing/routing-client";
import { createClient } from "@/lib/supabase/server";
import { ShipmentRepository } from "@/lib/repositories/shipment.repository";
import { nearestNeighbor } from "@/lib/utils/routing";

export default async function ShipmentsRoutingPage() {
  // 서버 컴포넌트에서 Supabase 클라이언트 생성
  const supabase = await createClient();
  const repo = new ShipmentRepository(supabase);

  // 배송 목록 조회 (READY, ASSIGNED 상태 우선)
  const result = await repo.paginate({ page: 1, pageSize: 50 });
  const shipments = result.data;

  // 배송 순서 생성: order_id를 주소로 사용하여 nearest-neighbor 알고리즘 적용
  const orderList = shipments.map((s) => ({
    order_id: s.shipment_id,
    address: s.depart_date ?? s.shipment_id,
  }));
  const orderedIds = nearestNeighbor(orderList);

  // 순서 인덱스 맵 생성
  const sequenceMap = new Map(orderedIds.map((id, idx) => [id, idx + 1]));

  return (
    <div>
      <PageTitleBar
        title="배송라우팅"
        screenNumber="40007"
        breadcrumbs={[{ label: "주문배송" }, { label: "배송라우팅" }]}
      />
      <RoutingClient initialShipments={shipments} initialSequenceMap={sequenceMap} />
    </div>
  );
}
