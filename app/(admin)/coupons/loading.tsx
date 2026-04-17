import { Skeleton } from "@/components/ui/skeleton";

export default function CouponsLoading() {
  return (
    <div className="flex flex-col gap-0">
      {/* 검색조건 스켈레톤 */}
      <div className="bg-muted/30 flex items-end gap-3 border-b p-4">
        <div className="space-y-1">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-9 w-52" />
        </div>
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-16" />
      </div>

      {/* Panel 1 스켈레톤 */}
      <div className="space-y-3 p-4" style={{ maxHeight: "40vh" }}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>

      {/* Panel 2 탭 스켈레톤 */}
      <div className="flex-1 space-y-3 border-t p-4">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
