interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

/**
 * 테이블 로딩 스켈레톤 — loading.tsx 폴백에서 사용
 */
export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="w-full animate-pulse space-y-2">
      {/* 헤더 */}
      <div className="flex gap-2 border-b pb-2">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="bg-accent h-4 flex-1 rounded" />
        ))}
      </div>
      {/* 행 */}
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-2 py-1">
          {Array.from({ length: columns }).map((_, col) => (
            <div key={col} className="bg-accent h-4 flex-1 rounded opacity-70" />
          ))}
        </div>
      ))}
    </div>
  );
}
