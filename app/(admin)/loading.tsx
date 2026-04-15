import { TableSkeleton } from "@/components/skeletons/table-skeleton";

/**
 * 관리자 페이지 공통 로딩 폴백
 * Next.js App Router loading.tsx 컨벤션 — Suspense boundary로 자동 래핑됨
 */
export default function AdminLoading() {
  return (
    <div className="p-6" aria-busy="true" aria-label="페이지 로딩 중">
      {/* 페이지 타이틀 바 스켈레톤 */}
      <div className="bg-control border-separator mb-4 flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-baseline gap-2">
          <div className="bg-accent h-5 w-32 animate-pulse rounded" />
          <div className="bg-accent h-3 w-10 animate-pulse rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-accent h-4 w-32 animate-pulse rounded" />
        </div>
      </div>
      <div className="p-6">
        <TableSkeleton rows={8} columns={5} />
      </div>
    </div>
  );
}
