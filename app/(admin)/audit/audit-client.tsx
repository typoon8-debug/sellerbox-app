"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import type { PaginatedResult } from "@/lib/types/api";
import type { Database } from "@/lib/supabase/database.types";

type AuditLogRow = Database["public"]["Tables"]["audit_log"]["Row"];

// 액션별 배지 색상 매핑
const ACTION_CONFIG: Record<string, { label: string; className: string }> = {
  CREATE: {
    label: "생성",
    className:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  },
  UPDATE: {
    label: "수정",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  },
  DELETE: {
    label: "삭제",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  },
  LOGIN: {
    label: "로그인",
    className:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  },
  LOGOUT: {
    label: "로그아웃",
    className:
      "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
  },
};

const columns: DataTableColumn<AuditLogRow>[] = [
  { key: "id", header: "ID", className: "w-16" },
  {
    key: "action",
    header: "액션",
    render: (row) => {
      const cfg = ACTION_CONFIG[row.action] ?? {
        label: row.action,
        className: "bg-gray-50 text-gray-600 border-gray-200",
      };
      return (
        <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>
          {cfg.label}
        </Badge>
      );
    },
  },
  { key: "resource", header: "리소스" },
  { key: "user_id", header: "사용자 ID", className: "font-mono text-xs" },
  {
    key: "payload",
    header: "페이로드",
    render: (row) =>
      row.payload ? (
        <span className="text-muted-foreground font-mono text-xs">
          {JSON.stringify(row.payload).slice(0, 60)}
          {JSON.stringify(row.payload).length > 60 ? "…" : ""}
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    key: "created_at",
    header: "발생 일시",
    render: (row) => row.created_at.slice(0, 19).replace("T", " "),
  },
];

interface AuditClientProps {
  initialData: PaginatedResult<AuditLogRow>;
  initialSearch: string;
}

export function AuditClient({ initialData, initialSearch }: AuditClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);

  const handleSearch = (value: string) => {
    setSearch(value);
    startTransition(() => {
      const params = new URLSearchParams();
      if (value) params.set("q", value);
      params.set("page", "1");
      router.push(`/audit?${params.toString()}`);
    });
  };

  const handlePageChange = (page: number) => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      params.set("page", String(page));
      router.push(`/audit?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-4 p-6">
      {/* 검색 */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="리소스·액션 검색..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-xs"
        />
        <span className="text-muted-foreground text-sm">
          총 {initialData.totalCount.toLocaleString()}건
        </span>
      </div>

      {/* 데이터 테이블 (읽기 전용) */}
      <DataTable<AuditLogRow>
        data={initialData.data}
        columns={columns}
        rowKey={(row) => String(row.id)}
        pagination={{
          page: initialData.page,
          pageSize: initialData.pageSize,
          total: initialData.totalCount,
        }}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
