"use client";

import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { Truck, CheckCircle } from "lucide-react";
import type { ShipmentWithOrder } from "@/lib/repositories/shipment.repository";

interface ShipmentListPanelProps {
  shipments: ShipmentWithOrder[];
  selectedIds: Set<string>;
  onSelectionChange: (keys: Set<string>) => void;
  onStartDelivery: () => void;
  onCompleteDelivery: () => void;
  loading?: boolean;
}

const columns: DataTableColumn<ShipmentWithOrder>[] = [
  {
    key: "shipment_id",
    header: "배송ID",
    render: (row) => (
      <span className="text-text-placeholder font-mono text-xs">
        {row.shipment_id.slice(0, 8)}…
      </span>
    ),
    className: "w-28",
  },
  {
    key: "delivery_method",
    header: "배송방식",
    render: (row) =>
      row.order?.delivery_method ? (
        <DomainBadge type="deliveryMethod" status={row.order.delivery_method} />
      ) : (
        <span className="text-text-placeholder text-xs">-</span>
      ),
    className: "w-24",
  },
  {
    key: "ordered_at",
    header: "주문일시",
    render: (row) =>
      row.order?.ordered_at ? (
        <span className="text-xs">{row.order.ordered_at.slice(0, 16).replace("T", " ")}</span>
      ) : (
        <span className="text-text-placeholder text-xs">-</span>
      ),
    className: "w-36",
  },
  {
    key: "status",
    header: "배송상태",
    render: (row) => <DomainBadge type="shipment" status={row.status} />,
    className: "w-28",
  },
  {
    key: "depart_date",
    header: "출발예정",
    render: (row) =>
      row.depart_date ? (
        <span className="text-xs">
          {row.depart_date} {row.depart_time?.slice(0, 5) ?? ""}
        </span>
      ) : (
        <span className="text-text-placeholder text-xs">-</span>
      ),
    className: "w-36",
  },
  {
    key: "rider_id",
    header: "라이더",
    render: (row) => (
      <span className="text-text-placeholder text-xs">{row.rider_id?.slice(0, 8) ?? "-"}</span>
    ),
    className: "w-28",
  },
];

export function ShipmentListPanel({
  shipments,
  selectedIds,
  onSelectionChange,
  onStartDelivery,
  onCompleteDelivery,
  loading = false,
}: ShipmentListPanelProps) {
  const hasSelection = selectedIds.size > 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-text-main text-sm font-medium">
          전체 배송목록
          <span className="text-text-placeholder ml-1">({shipments.length}건)</span>
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onStartDelivery}
            disabled={!hasSelection || loading}
            className="gap-1"
          >
            <Truck className="h-4 w-4" />
            배송출발
            {hasSelection && ` (${selectedIds.size})`}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onCompleteDelivery}
            disabled={!hasSelection || loading}
            className="gap-1"
          >
            <CheckCircle className="h-4 w-4" />
            배송완료
            {hasSelection && ` (${selectedIds.size})`}
          </Button>
        </div>
      </div>
      <div className="max-h-[40vh] overflow-auto rounded-md border">
        <DataTable
          columns={columns}
          data={shipments}
          rowKey={(row) => row.shipment_id}
          selectable
          selectedKeys={selectedIds}
          onSelectionChange={onSelectionChange}
          loading={loading}
          hideSearch
          showRowActions={false}
          emptyMessage="배송 목록이 없습니다."
        />
      </div>
    </div>
  );
}
