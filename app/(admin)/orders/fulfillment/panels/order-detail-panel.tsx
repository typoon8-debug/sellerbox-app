import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { PriceDisplay } from "@/components/admin/domain/price-display";
import type { OrderItemWithInventory } from "@/lib/actions/domain/order-fulfillment.actions";
import type { OrderItemStatus } from "@/lib/types/domain/enums";

interface OrderDetailPanelProps {
  orderItems: OrderItemWithInventory[];
  loading: boolean;
  activeOrderId: string | null;
}

/** Panel 2: 주문 상세 아이템 DataTable */
export function OrderDetailPanel({ orderItems, loading, activeOrderId }: OrderDetailPanelProps) {
  const columns: DataTableColumn<OrderItemWithInventory>[] = [
    {
      key: "item_id",
      header: "상품ID",
      className: "w-28",
      render: (row) => <span className="font-mono text-xs">{row.item_id?.slice(0, 8) ?? "-"}</span>,
    },
    {
      key: "item_name",
      header: "상품명",
    },
    {
      key: "qty",
      header: "수량",
      className: "w-14 text-center",
    },
    {
      key: "unit_price",
      header: "단가",
      className: "w-24 text-right",
      render: (row) => <PriceDisplay amount={row.unit_price} />,
    },
    {
      key: "discount",
      header: "할인",
      className: "w-20 text-right",
      render: (row) => <PriceDisplay amount={row.discount ?? 0} />,
    },
    {
      key: "line_total",
      header: "소계금액",
      className: "w-24 text-right",
      render: (row) => <PriceDisplay amount={row.line_total} />,
    },
    {
      key: "status",
      header: "상태",
      className: "w-20",
      render: (row) => <DomainBadge type="orderItem" status={row.status as OrderItemStatus} />,
    },
    {
      key: "on_hand",
      header: "재고수량",
      className: "w-18 text-center",
      render: (row) => (
        <span className={row.on_hand < row.qty ? "font-medium text-red-600" : "text-foreground"}>
          {row.on_hand}
        </span>
      ),
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 헤더 */}
      <div className="flex flex-shrink-0 items-center border-b px-3 py-1.5">
        <span className="text-muted-foreground text-xs font-medium">
          {activeOrderId ? "주문 상세" : "주문을 선택해 주세요"}
        </span>
      </div>

      {/* 아이템 목록 테이블 */}
      <ScrollArea className="min-h-0 flex-1">
        <DataTable<OrderItemWithInventory>
          columns={columns}
          data={orderItems}
          rowKey={(row) => row.order_detail_id}
          loading={loading}
          showRowActions={false}
          hideSearch
          emptyMessage={
            activeOrderId ? "주문 상품이 없습니다." : "주문 목록에서 행을 클릭해 주세요."
          }
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
