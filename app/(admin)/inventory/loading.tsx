/**
 * 재고관리 페이지 로딩 스켈레톤 (3-패널 구조)
 */
export default function InventoryLoading() {
  return (
    <div className="flex h-full flex-col" aria-busy="true" aria-label="재고관리 로딩 중">
      {/* 타이틀 바 스켈레톤 */}
      <div className="bg-control border-separator flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-baseline gap-2">
          <div className="bg-accent h-5 w-40 animate-pulse rounded" />
          <div className="bg-accent h-3 w-12 animate-pulse rounded" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        {/* 검색 조건 스켈레톤 */}
        <div className="bg-panel border-separator flex flex-wrap items-center gap-2 rounded border p-3">
          <div className="bg-accent h-8 w-36 animate-pulse rounded" />
          <div className="bg-accent h-8 w-40 animate-pulse rounded" />
          <div className="bg-accent h-8 w-48 animate-pulse rounded" />
          <div className="bg-accent h-8 w-16 animate-pulse rounded" />
          <div className="bg-accent h-8 w-16 animate-pulse rounded" />
        </div>

        {/* Panel 1: 상품목록 스켈레톤 */}
        <div
          className="border-separator flex-none overflow-hidden rounded border"
          style={{ height: "260px" }}
        >
          <div className="bg-panel border-separator flex items-center gap-2 border-b px-3 py-2">
            <div className="bg-accent h-4 w-24 animate-pulse rounded" />
          </div>
          {/* 테이블 헤더 */}
          <div className="bg-panel border-separator flex gap-4 border-b px-3 py-2">
            <div className="bg-accent h-4 w-4 animate-pulse rounded" />
            {[80, 120, 80, 160, 72, 72, 60, 60].map((w, i) => (
              <div
                key={i}
                className="bg-accent h-4 animate-pulse rounded"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>
          {/* 테이블 행 */}
          {Array.from({ length: 5 }).map((_, r) => (
            <div key={r} className="border-separator flex items-center gap-4 border-b px-3 py-2">
              <div className="bg-accent h-4 w-4 animate-pulse rounded" />
              {[80, 120, 80, 160, 72, 72, 60, 60].map((w, i) => (
                <div
                  key={i}
                  className="bg-accent h-4 animate-pulse rounded"
                  style={{ width: `${w}px` }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* 하단 패널 영역 */}
        <div className="flex min-h-0 flex-1 gap-3">
          {/* Panel 2: 상품재고 스켈레톤 */}
          <div className="border-separator flex flex-1 flex-col overflow-hidden rounded border">
            <div className="bg-panel border-separator flex items-center justify-between border-b px-3 py-2">
              <div className="bg-accent h-4 w-24 animate-pulse rounded" />
              <div className="flex gap-2">
                <div className="bg-accent h-7 w-14 animate-pulse rounded" />
                <div className="bg-accent h-7 w-14 animate-pulse rounded" />
                <div className="bg-accent h-7 w-14 animate-pulse rounded" />
              </div>
            </div>
            {/* 테이블 헤더 */}
            <div className="bg-panel border-separator flex gap-4 border-b px-3 py-2">
              <div className="bg-accent h-4 w-4 animate-pulse rounded" />
              {[140, 80, 80, 72, 72, 80].map((w, i) => (
                <div
                  key={i}
                  className="bg-accent h-4 animate-pulse rounded"
                  style={{ width: `${w}px` }}
                />
              ))}
            </div>
            {/* 테이블 행 */}
            {Array.from({ length: 5 }).map((_, r) => (
              <div key={r} className="border-separator flex items-center gap-4 border-b px-3 py-2">
                <div className="bg-accent h-4 w-4 animate-pulse rounded" />
                <div className="bg-accent h-4 w-36 animate-pulse rounded" />
                <div className="bg-accent h-7 w-20 animate-pulse rounded" />
                <div className="bg-accent h-7 w-20 animate-pulse rounded" />
                {[72, 72, 80].map((w, i) => (
                  <div
                    key={i}
                    className="bg-accent h-4 animate-pulse rounded"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
