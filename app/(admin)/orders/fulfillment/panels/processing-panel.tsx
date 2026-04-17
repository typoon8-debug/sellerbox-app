import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { PriceDisplay } from "@/components/admin/domain/price-display";
import { ShoppingBag, Package, Printer, FileText } from "lucide-react";
import type { OrderWithCustomer } from "@/lib/actions/domain/order-fulfillment.actions";
import type { OrderStatus, DeliveryMethod } from "@/lib/types/domain/enums";

interface ProcessingPanelProps {
  processedOrders: OrderWithCustomer[];
  selectedOrderCount: number;
  loading: boolean;
  onPicking: () => void;
  onPacking: () => void;
  onLabelPrint: () => void;
  onPrintList: () => void;
}

/** Panel 3: 주문처리 결과 + 액션 버튼 */
export function ProcessingPanel({
  processedOrders,
  selectedOrderCount,
  loading,
  onPicking,
  onPacking,
  onLabelPrint,
  onPrintList,
}: ProcessingPanelProps) {
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
      className: "w-24",
      render: (row) => <DomainBadge type="order" status={row.status as OrderStatus} />,
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 액션 버튼 영역 */}
      <div className="flex flex-shrink-0 items-center gap-2 border-b px-3 py-2">
        <Button
          size="sm"
          className="h-8 gap-1.5"
          disabled={loading || selectedOrderCount === 0}
          onClick={onPicking}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          주문 피킹
          {selectedOrderCount > 0 && (
            <span className="ml-1 rounded-full bg-white/20 px-1 text-xs">{selectedOrderCount}</span>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5"
          disabled={loading || selectedOrderCount === 0}
          onClick={onPacking}
        >
          <Package className="h-3.5 w-3.5" />
          패킹
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5"
          disabled={loading || selectedOrderCount === 0}
          onClick={onLabelPrint}
        >
          <Printer className="h-3.5 w-3.5" />
          라벨출력
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5"
          disabled={loading || selectedOrderCount === 0}
          onClick={onPrintList}
        >
          <FileText className="h-3.5 w-3.5" />
          피킹/패킹리스트 출력
        </Button>
      </div>

      {/* 처리 결과 테이블 */}
      <ScrollArea className="min-h-0 flex-1">
        <DataTable<OrderWithCustomer>
          columns={columns}
          data={processedOrders}
          rowKey={(row) => row.order_id}
          loading={loading}
          showRowActions={false}
          hideSearch
          emptyMessage="처리된 주문이 없습니다. 주문 목록에서 선택 후 버튼을 눌러 주세요."
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
