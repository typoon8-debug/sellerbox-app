/**
 * 배송 현황판 로딩 스켈레톤
 * 카드 4종 + 타임라인 스켈레톤 형태
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6" aria-busy="true" aria-label="배송 현황판 로딩 중">
      {/* 타이틀 바 스켈레톤 */}
      <div className="bg-control border-separator -mx-6 -mt-6 mb-2 flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-baseline gap-2">
          <div className="bg-accent h-5 w-28 animate-pulse rounded" />
          <div className="bg-accent h-3 w-12 animate-pulse rounded" />
        </div>
      </div>

      {/* 현황 카드 4종 스켈레톤 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-separator bg-panel flex animate-pulse flex-col gap-2 rounded-lg border p-4"
          >
            <div className="bg-accent h-10 w-10 rounded-lg" />
            <div className="bg-accent h-3 w-16 rounded" />
            <div className="bg-accent h-7 w-12 rounded" />
          </div>
        ))}
      </div>

      {/* 타임라인 스켈레톤 */}
      <div>
        <div className="bg-accent mb-4 h-4 w-24 animate-pulse rounded" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex animate-pulse items-start gap-4">
              <div className="bg-accent h-4 w-32 rounded" />
              <div className="border-separator bg-panel flex-1 rounded border px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="bg-accent h-5 w-16 rounded-full" />
                  <div className="bg-accent h-4 w-24 rounded" />
                </div>
                <div className="bg-accent mt-1 h-3 w-40 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
