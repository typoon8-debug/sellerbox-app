import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* 검색 조건 스켈레톤 */}
      <div className="bg-card flex gap-3 rounded-lg border p-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>

      {/* Panel 1 스켈레톤 */}
      <div className="bg-card rounded-lg border p-4">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>

      {/* Panel 2 스켈레톤 */}
      <div className="bg-card flex-1 rounded-lg border p-4">
        <Skeleton className="mb-3 h-5 w-40" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-lg border">
              <Skeleton className="h-10 w-full rounded-b-none" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
