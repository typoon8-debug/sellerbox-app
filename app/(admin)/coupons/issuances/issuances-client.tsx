"use client";

import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { MOCK_COUPON_ISSUANCES } from "@/lib/mocks/coupon";
import type { CouponIssuanceRow } from "@/lib/types/domain/promotion";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ISSUED: { label: "발급", className: "bg-primary-light text-primary border-primary/30" },
  USED: { label: "사용", className: "bg-blue-50 text-blue-700 border-blue-200" },
  EXPIRED: { label: "만료", className: "bg-disabled text-text-placeholder border-separator" },
  CANCELLED: { label: "취소", className: "bg-alert-red-bg text-alert-red border-alert-red/30" },
};

const columns: DataTableColumn<CouponIssuanceRow>[] = [
  { key: "issuance_id", header: "발급 ID", className: "w-28" },
  { key: "coupon_id", header: "쿠폰 ID" },
  { key: "customer_id", header: "고객 ID" },
  {
    key: "issued_status",
    header: "상태",
    render: (row) => {
      const cfg = STATUS_CONFIG[row.issued_status ?? ""] ?? {
        label: row.issued_status ?? "-",
        className: "bg-disabled text-text-placeholder border-separator",
      };
      return (
        <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>
          {cfg.label}
        </Badge>
      );
    },
  },
  {
    key: "issued_at",
    header: "발급일시",
    render: (row) => row.issued_at?.slice(0, 16).replace("T", " ") ?? "-",
  },
  {
    key: "expires_at",
    header: "만료일",
    render: (row) => row.expires_at?.slice(0, 10) ?? "-",
  },
];

export function IssuancesClient() {
  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={MOCK_COUPON_ISSUANCES}
        rowKey={(row) => row.issuance_id}
        searchPlaceholder="발급ID·고객ID 검색"
        showRowActions={false}
        emptyMessage="발급 이력이 없습니다."
      />
    </div>
  );
}
