"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { DateRangePicker } from "@/components/admin/domain/date-range-picker";
import type { AdLogRow } from "@/lib/types/domain/advertisement";
import type { PaginatedResult } from "@/lib/types/api";
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

interface AdsLogsClientProps {
  initialData: PaginatedResult<AdLogRow>;
  initialContentId: string;
  initialAction: string;
}

export function AdsLogsClient({
  initialData,
  initialContentId,
  initialAction,
}: AdsLogsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [contentId, setContentId] = useState(initialContentId);
  const [actionFilter, setActionFilter] = useState(initialAction);

  // 필터 변경 시 URL 파라미터 업데이트 → 서버 재조회
  const applyFilters = (
    newContentId: string,
    newAction: string,
    newDateFrom?: Date,
    newDateTo?: Date
  ) => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (newContentId) params.set("content_id", newContentId);
      if (newAction !== "ALL") params.set("action", newAction);
      if (newDateFrom) params.set("date_from", newDateFrom.toISOString().slice(0, 10));
      if (newDateTo) params.set("date_to", newDateTo.toISOString().slice(0, 10));
      router.push(`?${params.toString()}`);
    });
  };

  const handleContentIdChange = (value: string) => {
    setContentId(value);
  };

  const handleContentIdSearch = () => {
    applyFilters(contentId, actionFilter, dateFrom, dateTo);
  };

  const handleActionChange = (value: string) => {
    setActionFilter(value);
    applyFilters(contentId, value, dateFrom, dateTo);
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    applyFilters(contentId, actionFilter, date, dateTo);
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    applyFilters(contentId, actionFilter, dateFrom, date);
  };

  return (
    <div className="space-y-4 p-6">
      {/* 필터 영역 */}
      <div className="flex flex-wrap items-center gap-3">
        <DateRangePicker
          from={dateFrom}
          to={dateTo}
          onFromChange={handleDateFromChange}
          onToChange={handleDateToChange}
        />
        <div className="flex items-center gap-2">
          <Input
            className="h-8 w-48 text-sm"
            placeholder="콘텐츠 ID"
            value={contentId}
            onChange={(e) => handleContentIdChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleContentIdSearch()}
          />
        </div>
        <Select value={actionFilter} onValueChange={handleActionChange} disabled={isPending}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="액션 유형" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            <SelectItem value="IMPRESSION">노출</SelectItem>
            <SelectItem value="CLICK">클릭</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={initialData.data}
        rowKey={(row) => row.log_id}
        searchPlaceholder="콘텐츠 ID·사용자 ID 검색"
        showRowActions={false}
        emptyMessage="광고 로그가 없습니다."
      />
    </div>
  );
}
