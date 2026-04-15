"use client";

import { useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { DateRangePicker } from "@/components/admin/domain/date-range-picker";
import { MOCK_AD_LOGS } from "@/lib/mocks/ad";
import type { AdLogRow } from "@/lib/types/domain/advertisement";
import { Badge } from "@/components/ui/badge";

const ACTION_CONFIG: Record<string, { label: string; className: string }> = {
  IMPRESSION: { label: "노출", className: "bg-blue-50 text-blue-700 border-blue-200" },
  CLICK: { label: "클릭", className: "bg-primary-light text-primary border-primary/30" },
};

const columns: DataTableColumn<AdLogRow>[] = [
  { key: "log_id", header: "로그 ID", className: "w-24" },
  { key: "content_id", header: "콘텐츠 ID" },
  {
    key: "action",
    header: "액션",
    render: (row) => {
      const cfg = ACTION_CONFIG[row.action ?? ""] ?? { label: row.action ?? "-", className: "" };
      return (
        <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>
          {cfg.label}
        </Badge>
      );
    },
  },
  { key: "page", header: "페이지" },
  { key: "area_key", header: "영역" },
  { key: "user_id", header: "사용자 ID", render: (row) => row.user_id ?? "비회원" },
  {
    key: "ts",
    header: "일시",
    render: (row) => row.ts?.slice(0, 16).replace("T", " ") ?? "-",
  },
];

export function AdsLogsClient() {
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  return (
    <div className="p-6">
      <div className="mb-4">
        <DateRangePicker
          from={dateFrom}
          to={dateTo}
          onFromChange={setDateFrom}
          onToChange={setDateTo}
        />
      </div>

      <DataTable
        columns={columns}
        data={MOCK_AD_LOGS}
        rowKey={(row) => row.log_id}
        searchPlaceholder="콘텐츠 ID·사용자 ID 검색"
        showRowActions={false}
        emptyMessage="광고 로그가 없습니다."
      />
    </div>
  );
}
