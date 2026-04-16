import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { Truck } from "lucide-react";
import type { DispatchRequestWithOrder } from "@/lib/actions/domain/order-fulfillment.actions";
import type { DispatchRequestStatus, DeliveryMethod } from "@/lib/types/domain/enums";

interface DispatchPanelProps {
  dispatchRequests: DispatchRequestWithOrder[];
  selectedOrderCount: number;
  loading: boolean;
  onDispatch: () => void;
}

/** Panel 4: 배송요청 테이블 */
export function DispatchPanel({
  dispatchRequests,
  selectedOrderCount,
  loading,
  onDispatch,
}: DispatchPanelProps) {
  const columns: DataTableColumn<DispatchRequestWithOrder>[] = [
    {
      key: "dispatch_id",
      header: "배차요청ID",
      className: "w-28",
      render: (row) => <span className="font-mono text-xs">{row.dispatch_id.slice(0, 8)}</span>,
    },
    {
      key: "order_no",
      header: "주문ID",
      className: "w-28",
      render: (row) => <span className="font-mono text-xs">{row.order_no}</span>,
    },
    {
      key: "customer_name",
      header: "회원명",
      className: "w-20",
    },
    {
      key: "delivery_method",
      header: "배송구분",
      className: "w-20",
      render: (row) =>
        row.delivery_method ? (
          <DomainBadge type="deliveryMethod" status={row.delivery_method as DeliveryMethod} />
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        ),
    },
    {
      key: "status",
      header: "상태",
      className: "w-24",
      render: (row) => (
        <DomainBadge type="dispatchRequest" status={row.status as DispatchRequestStatus} />
      ),
    },
    {
      key: "rider_id",
      header: "라이더",
      className: "w-20",
      render: (row) => (
        <span className="text-xs">{row.rider_id ? row.rider_id.slice(0, 8) : "-"}</span>
      ),
    },
    {
      key: "requested_at",
      header: "요청일시",
      className: "w-32",
      render: (row) => (
        <span className="text-xs">{row.requested_at?.slice(0, 16).replace("T", " ") ?? "-"}</span>
      ),
    },
    {
      key: "assigned_at",
      header: "배차일시",
      className: "w-32",
      render: (row) => (
        <span className="text-xs">{row.assigned_at?.slice(0, 16).replace("T", " ") ?? "-"}</span>
      ),
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 배송요청 버튼 */}
      <div className="flex flex-shrink-0 items-center border-b px-3 py-2">
        <Button
          size="sm"
          className="h-8 gap-1.5"
          disabled={loading || selectedOrderCount === 0}
          onClick={onDispatch}
        >
          <Truck className="h-3.5 w-3.5" />
          배송요청
          {selectedOrderCount > 0 && (
            <span className="ml-1 rounded-full bg-white/20 px-1 text-xs">{selectedOrderCount}</span>
          )}
        </Button>
      </div>

      {/* 배송요청 목록 */}
      <ScrollArea className="min-h-0 flex-1">
        <DataTable<DispatchRequestWithOrder>
          columns={columns}
          data={dispatchRequests}
          rowKey={(row) => row.dispatch_id}
          loading={loading}
          showRowActions={false}
          hideSearch
          emptyMessage="배송요청 내역이 없습니다."
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
