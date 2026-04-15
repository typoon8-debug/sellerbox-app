import { Button } from "@/components/ui/button";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
  pageWindowSize?: number;
  className?: string;
}

/**
 * 가이드 §6 페이지네이션
 * - 32×32 정사각 버튼, 2px gap
 * - Normal Body2 / Selected H3(Bold)
 * - First / Prev / 페이지 번호 / Next / Last
 */
export function PaginationBar({
  page,
  totalPages,
  total,
  onPageChange,
  pageWindowSize = 5,
  className,
}: PaginationBarProps) {
  if (totalPages <= 1 && !total) return null;

  // 페이지 윈도우 계산 (최대 pageWindowSize개)
  const half = Math.floor(pageWindowSize / 2);
  let start = Math.max(1, page - half);
  const end = Math.min(totalPages, start + pageWindowSize - 1);
  if (end - start + 1 < pageWindowSize) {
    start = Math.max(1, end - pageWindowSize + 1);
  }
  const pageNums = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {total !== undefined && (
        <span className="text-text-placeholder text-sm">총 {total.toLocaleString()}건</span>
      )}
      {totalPages > 1 && (
        <div className="ml-auto flex items-center gap-0.5">
          {/* First */}
          <Button
            variant="ghost"
            size="icon"
            disabled={page <= 1}
            onClick={() => onPageChange(1)}
            aria-label="첫 페이지"
          >
            <ChevronFirst className="h-4 w-4" />
          </Button>
          {/* Prev */}
          <Button
            variant="ghost"
            size="icon"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="이전 페이지"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageNums.map((n) => {
            const isSelected = n === page;
            return (
              <Button
                key={n}
                variant={isSelected ? "outline-gray" : "ghost"}
                size="icon"
                className={cn(isSelected && "font-bold")}
                onClick={() => onPageChange(n)}
                aria-current={isSelected ? "page" : undefined}
              >
                {n}
              </Button>
            );
          })}

          {/* Next */}
          <Button
            variant="ghost"
            size="icon"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="다음 페이지"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {/* Last */}
          <Button
            variant="ghost"
            size="icon"
            disabled={page >= totalPages}
            onClick={() => onPageChange(totalPages)}
            aria-label="마지막 페이지"
          >
            <ChevronLast className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
