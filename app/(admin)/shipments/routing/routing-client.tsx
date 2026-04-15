"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_SHIPMENTS } from "@/lib/mocks/shipment";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { RotateCcw } from "lucide-react";

type RoutedShipment = (typeof MOCK_SHIPMENTS)[number] & { route_order: number };

export function RoutingClient() {
  const [shipments, setShipments] = useState<RoutedShipment[]>(
    MOCK_SHIPMENTS.map((s, idx) => ({ ...s, route_order: idx + 1 }))
  );

  const handleGenerateRoute = () => {
    const shuffled = [...shipments]
      .sort(() => Math.random() - 0.5)
      .map((s, idx) => ({ ...s, route_order: idx + 1 }));
    setShipments(shuffled);
    toast.success("배송 순서가 최적화되었습니다.");
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-end">
        <Button onClick={handleGenerateRoute} variant="outline-gray" size="sm">
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          순서 생성
        </Button>
      </div>
      <div className="space-y-2">
        {shipments
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
