import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";

interface QueryActionsProps {
  onSearch: () => void;
  onReset: () => void;
  searchLabel?: string;
  resetLabel?: string;
  loading?: boolean;
}

/** 조회모듈 조회/초기화 버튼 표준 (가이드 §5: 조회 solid blue, 초기화 outline-gray) */
export function QueryActions({
  onSearch,
  onReset,
  searchLabel = "조회",
  resetLabel = "초기화",
  loading = false,
}: QueryActionsProps) {
  return (
    <div className="flex items-end gap-2">
      <Button
        type="button"
        variant="primary"
        data-cta="search"
        onClick={onSearch}
        disabled={loading}
      >
        <Search className="mr-1 h-4 w-4" />
        {searchLabel}
      </Button>
      <Button type="button" variant="outline-gray" onClick={onReset} disabled={loading}>
        <RotateCcw className="mr-1 h-4 w-4" />
        {resetLabel}
      </Button>
    </div>
  );
}
