"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import type { CouponRedemptionRow } from "@/lib/types/domain/promotion";

const REDEMPTION_STATUS: Record<string, { label: string; className: string }> = {
  APPLIED: { label: "적용", className: "bg-primary-light text-primary border-primary/30" },
  REVOKED: { label: "취소", className: "bg-alert-red-bg text-alert-red border-alert-red/30" },
  FAILED: { label: "실패", className: "bg-disabled text-text-placeholder border-separator" },
};

const columns: DataTableColumn<CouponRedemptionRow>[] = [
  {
    key: "redemption_id",
    header: "사용ID",
    className: "w-28 truncate text-xs text-muted-foreground",
  },
  {
    key: "issuance_id",
    header: "발급ID",
    className: "w-28 truncate text-xs text-muted-foreground",
  },
  {
    key: "order_id",
    header: "주문ID",
    className: "w-28 truncate text-xs text-muted-foreground",
  },
  {
    key: "discount_amount",
    header: "할인금액",
    render: (row) => `${row.discount_amount.toLocaleString()}원`,
  },
  {
    key: "status",
    header: "상태",
    render: (row) => {
      const cfg = REDEMPTION_STATUS[row.status ?? ""] ?? {
        label: row.status ?? "-",
        className: "",
      };
      return (
        <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>
          {cfg.label}
        </Badge>
      );
    },
  },
  {
    key: "used_at",
    header: "사용일시",
    render: (row) => row.used_at?.slice(0, 16).replace("T", " ") ?? "-",
  },
];

interface RedemptionTabProps {
  redemptions: CouponRedemptionRow[];
}

export function RedemptionTab({ redemptions }: RedemptionTabProps) {
  return (
    <DataTable
      columns={columns}
      data={redemptions}
      rowKey={(row) => row.redemption_id}
      searchPlaceholder="사용ID·주문ID 검색"
      showRowActions={false}
      emptyMessage="사용 이력이 없습니다."
    />
  );
}
