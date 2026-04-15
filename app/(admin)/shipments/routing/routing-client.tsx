"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { nearestNeighbor } from "@/lib/utils/routing";
import type { ShipmentRow } from "@/lib/types/domain/shipment";
import { RotateCcw } from "lucide-react";

// 배송 순서가 부여된 배송 타입
type RoutedShipment = ShipmentRow & { route_order: number };

interface RoutingClientProps {
  initialShipments: ShipmentRow[];
  initialSequenceMap: Map<string, number>;
}

export function RoutingClient({ initialShipments, initialSequenceMap }: RoutingClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 초기 배송 순서 적용
  const [shipments, setShipments] = useState<RoutedShipment[]>(() =>
    initialShipments.map((s) => ({
      ...s,
      route_order: initialSequenceMap.get(s.shipment_id) ?? 0,
    }))
  );

  // nearest-neighbor 알고리즘으로 배송 순서 재생성
  const handleGenerateRoute = () => {
    const orderList = initialShipments.map((s) => ({
      order_id: s.shipment_id,
      address: s.depart_date ?? s.shipment_id,
    }));
    const orderedIds = nearestNeighbor(orderList);
    const sequenceMap = new Map(orderedIds.map((id, idx) => [id, idx + 1]));

    const reordered = initialShipments.map((s) => ({
      ...s,
      route_order: sequenceMap.get(s.shipment_id) ?? 0,
    }));

    setShipments(reordered);
    toast.success("배송 순서가 최적화되었습니다.");

    // 서버 데이터 갱신
    startTransition(() => router.refresh());
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-end">
        <Button onClick={handleGenerateRoute} variant="outline-gray" size="sm" disabled={isPending}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          순서 생성
        </Button>
      </div>
      <div className="space-y-2">
        {[...shipments]
          .sort((a, b) => a.route_order - b.route_order)
          .map((ship) => (
            <div
              key={ship.shipment_id}
              className="border-separator bg-panel flex items-center gap-4 rounded border px-4 py-3"
            >
              <Badge
                variant="outline"
                className="bg-primary text-primary-foreground border-primary flex h-8 w-8 items-center justify-center rounded-full font-bold"
              >
                {ship.route_order}
              </Badge>
              <div className="flex-1">
                <p className="text-sm font-medium">{ship.tracking_no ?? ship.shipment_id}</p>
                <p className="text-text-placeholder text-xs">
                  {ship.depart_date} {ship.depart_time}
                </p>
              </div>
              <DomainBadge type="shipment" status={ship.status ?? ""} />
            </div>
          ))}
      </div>
    </div>
  );
}
