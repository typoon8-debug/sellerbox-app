"use client";

import { type ReactNode, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SortableTableHead } from "@/components/admin/sortable-table-head";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  /** 정렬 가능한 경우 서버 측 컬럼명 (예: "created_at") */
  sortKey?: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
}

interface SortInfo {
  key: string;
  direction: "asc" | "desc";
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  searchPlaceholder?: string;
  toolbarActions?: ReactNode; // 모듈 제어 버튼 (행추가 등)
  onRowEdit?: (row: T) => void;
  onRowDelete?: (row: T) => void;
  onRowClick?: (row: T) => void;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onSearchChange?: (query: string) => void;
  /** controlled 모드: 부모가 검색어를 직접 제어할 때 전달 */
  searchValue?: string;
  /** 현재 정렬 상태 */
  sort?: SortInfo;
  /** 정렬 변경 콜백 */
  onSortChange?: (key: string, direction: "asc" | "desc") => void;
  loading?: boolean;
  showRowActions?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  searchPlaceholder = "검색어를 입력하세요",
  toolbarActions,
  onRowEdit,
  onRowDelete,
  onRowClick,
  pagination,
  onPageChange,
  onSearchChange,
  searchValue,
  sort,
  onSortChange,
  loading = false,
  showRowActions = true,
  emptyMessage = "데이터가 없습니다.",
}: DataTableProps<T>) {
  const isControlled = searchValue !== undefined;
  const [searchInput, setSearchInput] = useState("");
  const currentSearch = isControlled ? searchValue : searchInput;

  const handleSearchChange = (value: string) => {
    if (!isControlled) {
      setSearchInput(value);
    }
    onSearchChange?.(value);
  };

  const hasActions = showRowActions && (onRowEdit || onRowDelete);
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;

  /** 컬럼 헤더 클릭 시 정렬 방향 토글 */
  const handleSortClick = (sortKey: string) => {
    if (!onSortChange) return;
    if (sort?.key === sortKey) {
      onSortChange(sortKey, sort.direction === "asc" ? "desc" : "asc");
    } else {
      onSortChange(sortKey, "desc");
    }
  };

  /** 페이지 윈도우 계산: 현재 페이지 ±2 */
  const getPageWindows = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const currentPage = pagination?.page ?? 1;
    const pages: (number | "...")[] = [];
    pages.push(1);
    const rangeStart = Math.max(2, currentPage - 2);
    const rangeEnd = Math.min(totalPages - 1, currentPage + 2);
    if (rangeStart > 2) pages.push("...");
    for (let p = rangeStart; p <= rangeEnd; p++) pages.push(p);
    if (rangeEnd < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 툴바 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">{toolbarActions}</div>
        <div className="relative">
          <Search className="text-text-placeholder absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
          <Input
            placeholder={searchPlaceholder}
            value={currentSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-8 w-56 pl-8 text-sm"
            aria-label="테이블 검색"
          />
        </div>
      </div>

      {/* 테이블 — 가로/세로 스크롤 허용 */}
      <div className="border-separator rounded border">
        <ScrollArea className="w-full">
          <Table
            aria-rowcount={pagination ? pagination.total : data.length}
            aria-colcount={columns.length + (hasActions ? 1 : 0)}
          >
            <TableHeader>
              <TableRow className="bg-panel hover:bg-panel">
                {columns.map((col) =>
                  col.sortKey && onSortChange ? (
                    <SortableTableHead
                      key={col.key}
                      direction={sort?.key === col.sortKey ? sort.direction : "none"}
                      onSort={() => handleSortClick(col.sortKey!)}
                      className={col.className}
                    >
                      {col.header}
                    </SortableTableHead>
                  ) : (
                    <TableHead key={col.key} className={col.className ?? "whitespace-nowrap"}>
                      {col.header}
                    </TableHead>
                  )
                )}
                {hasActions && <TableHead className="w-24 text-center">액션</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody aria-live="polite" aria-busy={loading}>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (hasActions ? 1 : 0)}
                    className="text-text-placeholder h-32 text-center"
                  >
                    <span aria-label="데이터 로딩 중">불러오는 중...</span>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} className="h-32 p-0">
                    <EmptyState title="데이터 없음" description={emptyMessage} />
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow
                    key={rowKey(row)}
                    className={onRowClick ? "cursor-pointer" : undefined}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className ?? "whitespace-nowrap"}>
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[col.key] ?? "")}
                      </TableCell>
                    ))}
                    {hasActions && (
                      <TableCell className="text-center">
                        <div
                          className="flex items-center justify-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {onRowEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => onRowEdit(row)}
                            >
                              수정
                            </Button>
                          )}
                          {onRowDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-alert-red hover:text-alert-red h-7 px-2 text-xs"
                              onClick={() => onRowDelete(row)}
                            >
                              삭제
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* 페이지네이션 (가이드 §6: 32px 정사각 버튼, 2px gap) */}
      {pagination && totalPages > 1 && (
        <div className="text-text-placeholder flex items-center justify-between text-sm">
          <span>
            총 {pagination.total}건 / {pagination.page}/{totalPages} 페이지
          </span>
          <div className="flex items-center gap-0.5">
            {/* 첫 페이지 */}
            <Button
              variant="ghost"
              size="icon"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(1)}
              aria-label="첫 페이지"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            {/* 이전 */}
            <Button
              variant="ghost"
              size="icon"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
              aria-label="이전 페이지"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {/* 페이지 윈도우 */}
            {getPageWindows().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="text-text-placeholder px-1 text-xs">
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={pagination.page === p ? "outline-gray" : "ghost"}
                  size="icon"
                  className={pagination.page === p ? "font-bold" : "text-xs"}
                  onClick={() => onPageChange?.(p as number)}
                  aria-label={`${p}페이지`}
                  aria-current={pagination.page === p ? "page" : undefined}
                >
                  {p}
                </Button>
              )
            )}
            {/* 다음 */}
            <Button
              variant="ghost"
              size="icon"
              disabled={pagination.page >= totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
              aria-label="다음 페이지"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {/* 마지막 페이지 */}
            <Button
              variant="ghost"
              size="icon"
              disabled={pagination.page >= totalPages}
              onClick={() => onPageChange?.(totalPages)}
              aria-label="마지막 페이지"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
