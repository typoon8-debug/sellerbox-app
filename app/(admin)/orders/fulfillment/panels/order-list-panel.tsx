import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { PriceDisplay } from "@/components/admin/domain/price-display";
import { Button } from "@/components/ui/button";
import { OrderStatusSelect } from "@/app/(admin)/orders/fulfillment/components/order-status-select";
import type { OrderWithCustomer } from "@/lib/actions/domain/order-fulfillment.actions";
import type { OrderStatus, DeliveryMethod } from "@/lib/types/domain/enums";

/** 배송구분 필터 옵션 */
const DELIVERY_FILTERS: { label: string; value: string }[] = [
  { label: "전체", value: "ALL" },
  { label: "배송", value: "DELIVERY" },
  { label: "예약", value: "RESERVE" },
  { label: "당일", value: "SAME_DAY" },
  { label: "새벽", value: "FRESH_MORNING" },
  { label: "BBQ", value: "BBQ" },
];

interface OrderListPanelProps {
  orders: OrderWithCustomer[];
  loading: boolean;
  selectedOrderIds: Set<string>;
  activeOrderId: string | null;
  deliveryFilter: string;
  onDeliveryFilterChange: (filter: string) => void;
  onSelectionChange: (ids: Set<string>) => void;
  onRowClick: (order: OrderWithCustomer) => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

/** Panel 1: 주문목록 DataTable */
export function OrderListPanel({
  orders,
  loading,
  selectedOrderIds,
  activeOrderId,
  deliveryFilter,
  onDeliveryFilterChange,
  onSelectionChange,
  onRowClick,
  onStatusChange,
}: OrderListPanelProps) {
  /** 배송구분 필터 적용 */
  const filteredOrders =
    deliveryFilter === "ALL" ? orders : orders.filter((o) => o.delivery_method === deliveryFilter);

  const columns: DataTableColumn<OrderWithCustomer>[] = [
    {
      key: "order_no",
      header: "주문번호",
      className: "w-36",
      render: (row) => (
        <span className="font-mono text-xs">{row.order_no ?? row.order_id.slice(0, 8)}</span>
      ),
    },
    {
      key: "customer_name",
      header: "회원명",
      className: "w-20",
    },
    {
      key: "final_payable",
      header: "결제금액",
      className: "w-24 text-right",
      render: (row) => <PriceDisplay amount={row.final_payable ?? 0} />,
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
      key: "ordered_at",
      header: "주문일자",
      className: "w-28",
      render: (row) => (
        <span className="text-xs">{row.ordered_at?.slice(0, 16).replace("T", " ")}</span>
      ),
    },
    {
      key: "status",
      header: "상태",
      className: "w-32",
      render: (row) => (
        <OrderStatusSelect
          orderId={row.order_id}
          currentStatus={row.status as OrderStatus}
          onStatusChange={onStatusChange}
        />
      ),
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 배송구분 필터 탭 */}
      <div className="flex flex-shrink-0 items-center gap-1 border-b px-3 py-1.5">
        {DELIVERY_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            variant={deliveryFilter === filter.value ? "default" : "ghost"}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => onDeliveryFilterChange(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* 주문 목록 테이블 */}
      <ScrollArea className="min-h-0 flex-1">
        <DataTable<OrderWithCustomer>
          columns={columns}
          data={filteredOrders}
          rowKey={(row) => row.order_id}
          loading={loading}
          selectable
          selectedKeys={selectedOrderIds}
          onSelectionChange={onSelectionChange}
          onRowClick={onRowClick}
          activeRowKey={activeOrderId ?? undefined}
          showRowActions={false}
          hideSearch
          emptyMessage="조회된 주문이 없습니다."
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
