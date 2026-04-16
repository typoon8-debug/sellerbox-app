import { TableSkeleton } from "@/components/skeletons/table-skeleton";

/**
 * 상품설명 관리 페이지 로딩 스켈레톤
 */
export default function ItemDetailLoading() {
  return (
    <div aria-busy="true" aria-label="상품설명 관리 로딩 중">
      {/* 타이틀 바 스켈레톤 */}
      <div className="bg-control border-separator mb-0 flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-baseline gap-2">
          <div className="bg-accent h-5 w-32 animate-pulse rounded" />
          <div className="bg-accent h-3 w-12 animate-pulse rounded" />
        </div>
      </div>
      {/* 검색조건 스켈레톤 */}
      <div className="border-separator border-b p-4">
        <div className="flex gap-3">
          <div className="bg-accent h-9 w-52 animate-pulse rounded" />
          <div className="bg-accent h-9 w-40 animate-pulse rounded" />
          <div className="bg-accent h-9 w-20 animate-pulse rounded" />
        </div>
      </div>
      {/* 테이블 스켈레톤 */}
      <div className="p-4">
        <TableSkeleton rows={8} columns={5} />
      </div>
    </div>
  );
}
