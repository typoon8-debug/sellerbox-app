"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { fetchAdLogs } from "@/lib/actions/domain/ad.actions";
import type { AdLogRow } from "@/lib/types/domain/advertisement";
import { Badge } from "@/components/ui/badge";

interface LogTabProps {
  contentId: string;
  logs: AdLogRow[];
  onDataChange: (data: AdLogRow[]) => void;
}

export function LogTab({ contentId, logs, onDataChange }: LogTabProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [action, setAction] = useState("__ALL__");
  const [isPending, startTransition] = useTransition();

  const columns: DataTableColumn<AdLogRow>[] = [
    { key: "log_id", header: "로그ID", className: "w-28 truncate text-xs text-muted-foreground" },
    {
      key: "action",
      header: "액션",
      render: (row) => (
        <Badge
          variant="outline"
          className={
            row.action === "CLICK"
              ? "border-primary/30 bg-primary-light text-primary"
              : "border-blue-200 bg-blue-50 text-blue-700"
          }
        >
          {row.action}
        </Badge>
      ),
    },
    { key: "page", header: "페이지" },
    { key: "area_key", header: "지면" },
    { key: "user_id", header: "사용자", render: (row) => row.user_id ?? "-" },
    {
      key: "ts",
      header: "발생일시",
      render: (row) => row.ts?.slice(0, 19).replace("T", " ") ?? "-",
    },
    { key: "ip", header: "IP", render: (row) => row.ip ?? "-" },
  ];

  const handleSearch = () => {
    startTransition(async () => {
      const result = await fetchAdLogs({
        content_id: contentId,
        from: from || undefined,
        to: to || undefined,
        action: action === "__ALL__" ? undefined : action,
      });
      if (!result.ok) {
        toast.error(result.error.message ?? "로그 조회 중 오류가 발생했습니다.");
        return;
      }
      onDataChange(result.data as AdLogRow[]);
    });
  };

  return (
    <div className="space-y-3">
      {/* 로그 필터 영역 */}
      <div className="bg-muted/30 flex flex-wrap items-end gap-3 rounded-md border p-3">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs font-medium">시작일</span>
          <Input
            type="datetime-local"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-8 w-44 text-xs"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs font-medium">종료일</span>
          <Input
            type="datetime-local"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-8 w-44 text-xs"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs font-medium">액션</span>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">전체</SelectItem>
              <SelectItem value="IMPRESSION">노출</SelectItem>
              <SelectItem value="CLICK">클릭</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={handleSearch} disabled={isPending}>
          {isPending ? "조회중..." : "조회"}
        </Button>
        <Button
          size="sm"
          variant="outline-gray"
          onClick={() => {
            setFrom("");
            setTo("");
            setAction("__ALL__");
          }}
        >
          초기화
        </Button>
      </div>

      {/* 로그 그리드 (읽기 전용) */}
      <DataTable
        columns={columns}
        data={logs}
        rowKey={(row) => row.log_id}
        showRowActions={false}
        hideSearch
        emptyMessage="조건에 맞는 로그가 없습니다."
      />
    </div>
  );
}
