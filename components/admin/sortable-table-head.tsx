import { TableHead } from "@/components/ui/table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SortDirection = "asc" | "desc" | "none";

interface SortableTableHeadProps {
  children: React.ReactNode;
  direction?: SortDirection;
  onSort?: () => void;
  className?: string;
}

/**
 * 가이드 §6 정렬 가능 테이블 헤더
 * - 정렬 아이콘 16×16, 라벨과 8px gap
 */
export function SortableTableHead({
  children,
  direction = "none",
  onSort,
  className,
}: SortableTableHeadProps) {
  const SortIcon = direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <TableHead
      className={cn(
        onSort && "hover:bg-hover cursor-pointer select-none",
        "whitespace-nowrap",
        className
      )}
      onClick={onSort}
    >
      <div className="flex items-center gap-2">
        {children}
        {onSort && (
          <SortIcon
            className={cn(
              "h-4 w-4 shrink-0",
              direction === "none" ? "text-text-placeholder/50" : "text-primary"
            )}
          />
        )}
      </div>
    </TableHead>
  );
}
