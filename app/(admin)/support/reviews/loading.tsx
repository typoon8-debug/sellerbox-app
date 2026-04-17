import { Skeleton } from "@/components/ui/skeleton";

export default function SupportReviewsLoading() {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <Skeleton className="h-8 w-64" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-20" />
      </div>
      <Skeleton className="h-64 w-full" />
      <div className="flex gap-4">
        <Skeleton className="h-64 flex-1" />
        <Skeleton className="h-64 flex-1" />
      </div>
    </div>
  );
}
