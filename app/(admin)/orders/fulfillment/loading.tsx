import { Skeleton } from "@/components/ui/skeleton";

/** 주문처리 통합 화면 로딩 스켈레톤 */
export default function OrderFulfillmentLoading() {
  return (
    <div className="flex h-full flex-col gap-0">
      {/* 검색조건 영역 */}
      <div className="border-b bg-white px-4 py-3">
        <div className="flex flex-wrap items-end gap-3">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>

      {/* 대시보드 카드 */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* 상단 패널 */}
      <div className="flex max-h-[38vh] divide-x border-b">
        <div className="w-1/2 p-4">
          <Skeleton className="mb-3 h-8 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="mb-2 h-10 w-full" />
          ))}
        </div>
        <div className="w-1/2 p-4">
          <Skeleton className="mb-3 h-8 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="mb-2 h-10 w-full" />
          ))}
        </div>
      </div>

      {/* 하단 패널 */}
      <div className="flex flex-1 divide-x">
        <div className="w-1/2 p-4">
          <div className="mb-3 flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="mb-2 h-10 w-full" />
          ))}
        </div>
        <div className="w-1/2 p-4">
          <Skeleton className="mb-3 h-9 w-24" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="mb-2 h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
