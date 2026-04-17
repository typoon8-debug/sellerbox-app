"use client";

import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import type { CsTicketWithJoins } from "@/lib/types/domain/support";

interface CsTicketTableProps {
  tickets: CsTicketWithJoins[];
  activeTicketId: string | null;
  onRowClick: (ticket: CsTicketWithJoins) => void;
  loading?: boolean;
}

const CS_TYPE_LABELS: Record<string, string> = {
  REFUND: "환불",
  EXCHANGE: "교환",
  INQUIRY: "문의",
};

const columns: DataTableColumn<CsTicketWithJoins>[] = [
  {
    key: "ticket_id",
    header: "CS티켓ID",
    render: (row) => (
      <span className="font-mono text-xs text-gray-500">{row.ticket_id.slice(0, 8)}…</span>
    ),
    className: "w-28",
  },
  {
    key: "customer_id",
    header: "회원ID",
    render: (row) => (
      <span className="text-xs">{row.customer?.email ?? row.customer_id.slice(0, 8) + "…"}</span>
    ),
    className: "w-40",
  },
  {
    key: "order_id",
    header: "주문ID",
    render: (row) => (
      <span className="font-mono text-xs text-gray-500">{row.order_id.slice(0, 8)}…</span>
    ),
    className: "w-28",
  },
  {
    key: "type",
    header: "유형",
    render: (row) => <DomainBadge type="csTicket" status={row.type} />,
    className: "w-20",
  },
  {
    key: "cs_contents",
    header: "CS내용",
    render: (row) => <span className="line-clamp-1 max-w-xs text-xs">{row.cs_contents}</span>,
  },
  {
    key: "created_at",
    header: "생성일",
    render: (row) => <span className="text-xs">{row.created_at.slice(0, 10)}</span>,
    className: "w-24",
  },
  {
    key: "modified_at",
    header: "수정일",
    render: (row) => <span className="text-xs">{row.modified_at.slice(0, 10)}</span>,
    className: "w-24",
  },
  {
    key: "status",
    header: "상태",
    render: (row) => <DomainBadge type="csTicket" status={row.status} />,
    className: "w-24",
  },
];

// 미사용 변수 제거
void CS_TYPE_LABELS;

export function CsTicketTable({
  tickets,
  activeTicketId,
  onRowClick,
  loading = false,
}: CsTicketTableProps) {
  return (
    <div className="max-h-[40vh] overflow-auto rounded-md border">
      <DataTable
        columns={columns}
        data={tickets}
        rowKey={(row) => row.ticket_id}
        loading={loading}
        hideSearch
        showRowActions={false}
        emptyMessage="조회된 CS 티켓이 없습니다."
        onRowClick={onRowClick}
        rowClassName={(row) =>
          row.ticket_id === activeTicketId ? "bg-blue-50 dark:bg-blue-950" : ""
        }
      />
    </div>
  );
}
