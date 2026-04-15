"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { MOCK_DISPATCH_REQUESTS } from "@/lib/mocks/shipment";
import type { DispatchRequestRow } from "@/lib/types/domain/shipment";
import { Plus } from "lucide-react";

const columns: DataTableColumn<DispatchRequestRow>[] = [
  { key: "dispatch_id", header: "요청 ID", className: "w-28" },
  { key: "order_id", header: "주문 ID" },
  {
    key: "status",
    header: "상태",
    render: (row) => <DomainBadge type="dispatchRequest" status={row.status ?? ""} />,
  },
  {
    key: "requested_at",
    header: "요청일시",
    render: (row) => row.requested_at?.slice(0, 16).replace("T", " ") ?? "-",
  },
  { key: "rider_id", header: "배달기사", render: (row) => row.rider_id ?? "-" },
];

export function RequestsClient() {
  const handleCreate = () => {
    toast.success("배송 요청이 생성되었습니다.");
  };

  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={MOCK_DISPATCH_REQUESTS}
        rowKey={(row) => row.dispatch_id}
        searchPlaceholder="요청 ID·주문 ID 검색"
        toolbarActions={
          <Button size="sm" onClick={handleCreate}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            배송 요청 생성
          </Button>
        }
        showRowActions={false}
      />
    </div>
  );
}
