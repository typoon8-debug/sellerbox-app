"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/admin/../ui/button";
import { Search, RotateCcw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TenantRow } from "@/lib/types/domain/store";

interface TenantSearchGridProps {
  tenants: TenantRow[];
  selectedTenantId: string | null;
  onTenantSelect: (tenant: TenantRow) => void;
  onSearch: (query: string) => void;
}

export function TenantSearchGrid({
  tenants,
  selectedTenantId,
  onTenantSelect,
  onSearch,
}: TenantSearchGridProps) {
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = () => {
    onSearch(searchInput);
  };

  const handleReset = () => {
    setSearchInput("");
    onSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="border-separator border-b p-4">
      {/* 검색 영역 */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-text-body w-16 shrink-0 text-sm font-medium">테넌트명</span>
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="테넌트명 또는 코드 검색"
          className="max-w-xs"
        />
        <Button size="sm" variant="primary" onClick={handleSearch}>
          <Search className="mr-1 h-3.5 w-3.5" />
          조회
        </Button>
        <Button size="sm" variant="outline-gray" onClick={handleReset}>
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          초기화
        </Button>
        <span className="text-text-placeholder ml-auto text-xs">전체 {tenants.length}개</span>
      </div>

      {/* 테넌트 Grid */}
      <ScrollArea className="h-[160px]">
        <div className="border-separator rounded border">
          <Table>
            <TableHeader>
              <TableRow className="bg-panel">
                <TableHead className="w-52">테넌트 ID</TableHead>
                <TableHead>테넌트명</TableHead>
                <TableHead className="w-32">테넌트 코드</TableHead>
                <TableHead className="w-24">유형</TableHead>
                <TableHead className="w-24">상태</TableHead>
                <TableHead className="w-36">생성일시</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-text-placeholder py-6 text-center text-sm">
                    테넌트가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                tenants.map((tenant) => (
                  <TableRow
                    key={tenant.tenant_id}
                    onClick={() => onTenantSelect(tenant)}
                    className={`cursor-pointer ${
                      selectedTenantId === tenant.tenant_id ? "bg-primary-light" : "hover:bg-hover"
                    }`}
                  >
                    <TableCell className="font-mono text-xs">{tenant.tenant_id}</TableCell>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>{tenant.code}</TableCell>
                    <TableCell>{tenant.type ?? "-"}</TableCell>
                    <TableCell>
                      <DomainBadge type="store" status={tenant.status} />
                    </TableCell>
                    <TableCell className="text-xs">
                      {tenant.created_at?.slice(0, 10) ?? "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}
