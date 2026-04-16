// F004: 패킹 작업 관리
// 작업 상태 데이터는 실시간성이 중요 → 캐시 없이 렌더링
export const revalidate = 0;

import { PageTitleBar } from "@/components/contents/page-title-bar";
import { PackingClient } from "@/app/(admin)/orders/packing/packing-client";
import { createAdminClient } from "@/lib/supabase/admin";
import { PackingTaskRepository } from "@/lib/repositories/packing-task.repository";

export default async function OrdersPackingPage() {
  const supabase = createAdminClient();
  const repo = new PackingTaskRepository(supabase);

  // 패킹 작업 목록 조회
  const result = await repo.paginate({
    page: 1,
    pageSize: 50,
    sortBy: "pack_id",
    sortOrder: "desc",
  });

  return (
    <div>
      <PageTitleBar
        title="패킹 작업 관리"
        screenNumber="40002"
        breadcrumbs={[{ label: "주문배송" }, { label: "패킹 작업 관리" }]}
      />
      <PackingClient initialData={result.data} />
    </div>
  );
}
