// F003: 피킹 작업 관리
// 작업 상태 데이터는 실시간성이 중요 → 캐시 없이 렌더링
export const revalidate = 0;

import { PageTitleBar } from "@/components/contents/page-title-bar";
import { PickingClient } from "@/app/(admin)/orders/picking/picking-client";
import { createAdminClient } from "@/lib/supabase/admin";
import { PickingTaskRepository } from "@/lib/repositories/picking-task.repository";

export default async function OrdersPickingPage() {
  const supabase = createAdminClient();
  const repo = new PickingTaskRepository(supabase);

  // 피킹 작업 목록 조회 (전체, 최신순)
  const result = await repo.paginate({
    page: 1,
    pageSize: 50,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  return (
    <div>
      <PageTitleBar
        title="피킹 작업 관리"
        screenNumber="40001"
        breadcrumbs={[{ label: "주문배송" }, { label: "피킹 작업 관리" }]}
      />
      <PickingClient initialData={result.data} />
    </div>
  );
}
