"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { MOCK_ORDERS } from "@/lib/mocks/order";
import type { OrderWithMeta } from "@/lib/mocks/order";

const columns: DataTableColumn<OrderWithMeta & { weight?: number }>[] = [
  { key: "order_no", header: "주문번호" },
  { key: "customer_name", header: "고객명" },
  {
    key: "status",
    header: "상태",
    render: (row) => <DomainBadge type="order" status={row.status ?? ""} />,
  },
  {
    key: "item_count",
    header: "상품 수",
    render: (row) => `${row.item_count}개`,
  },
  {
    key: "weight",
    header: "중량(g)",
    render: () => <WeightInput />,
  },
];

function WeightInput() {
  const [weight, setWeight] = useState("");

  return (
    <Input
      type="number"
      placeholder="중량(g)"
      value={weight}
      onChange={(e) => setWeight(e.target.value)}
      className="h-7 w-24 text-xs"
      onClick={(e) => e.stopPropagation()}
    />
  );
}

export function PackingClient() {
  const packingOrders = MOCK_ORDERS.filter((o) => o.status === "PACKING" || o.status === "PAID");

  const handleComplete = (row: OrderWithMeta) => {
    toast.success(`주문 ${row.order_no} 패킹 완료 처리되었습니다.`);
  };

  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={packingOrders}
        rowKey={(row) => row.order_id}
        searchPlaceholder="주문번호·고객명 검색"
        toolbarActions={<span className="text-text-placeholder text-sm">패킹 대기 목록</span>}
        onRowEdit={handleComplete}
        showRowActions={true}
      />
    </div>
  );
}
