import { type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TableToolbarProps {
  /** 좌측: 등록/삭제 등 주요 액션 */
  actions?: ReactNode;
  /** 우측 추가 슬롯 */
  rightSlot?: ReactNode;
  /** 검색 Input 표시 여부 */
  showSearch?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  /** 총 건수 */
  total?: number;
}

/** DataTable 상단 툴바 표준 */
export function TableToolbar({
  actions,
  rightSlot,
  showSearch = true,
  searchValue = "",
  searchPlaceholder = "검색어를 입력하세요",
  onSearchChange,
  total,
}: TableToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      {/* 좌측: 액션 + 건수 */}
      <div className="flex items-center gap-2">
        {actions}
        {total !== undefined && (
          <span className="text-text-placeholder text-sm">총 {total.toLocaleString()}건</span>
        )}
      </div>

      {/* 우측: 검색 + 추가 슬롯 */}
      <div className="flex items-center gap-2">
        {showSearch && (
          <div className="relative">
            <Search className="text-text-placeholder absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 w-56 pl-8 text-sm"
            />
          </div>
        )}
        {rightSlot}
      </div>
    </div>
  );
}
