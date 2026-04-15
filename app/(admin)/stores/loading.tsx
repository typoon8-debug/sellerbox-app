import { TableSkeleton } from "@/components/skeletons/table-skeleton";

/**
 * 가게 목록 페이지 로딩 스켈레톤
 * 공통 loading.tsx보다 가까운 파일이 우선 적용됨
 */
export default function StoresLoading() {
  return (
    <div aria-busy="true" aria-label="가게 목록 로딩 중">
      {/* 타이틀 바 스켈레톤 */}
      <div className="bg-control border-separator mb-0 flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-baseline gap-2">
          <div className="bg-accent h-5 w-24 animate-pulse rounded" />
          <div className="bg-accent h-3 w-12 animate-pulse rounded" />
        </div>
      </div>
      <div className="p-6">
        <TableSkeleton rows={10} columns={6} />
      </div>
    </div>
  );
}
