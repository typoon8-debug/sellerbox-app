// F005: 라벨 관리
export const dynamic = "force-dynamic";

import { PageTitleBar } from "@/components/contents/page-title-bar";
import { LabelsClient } from "@/app/(admin)/orders/labels/labels-client";
import { createAdminClient } from "@/lib/supabase/admin";
import { LabelRepository } from "@/lib/repositories/label.repository";

export default async function OrdersLabelsPage() {
  const supabase = createAdminClient();
  const repo = new LabelRepository(supabase);

  // 라벨 전체 조회
  const labels = await repo.findAll({ sortBy: "label_id", sortOrder: "desc" });

  return (
    <div>
      <PageTitleBar
        title="라벨 관리"
        screenNumber="31003"
        breadcrumbs={[{ label: "주문 처리" }, { label: "라벨 관리" }]}
      />
      <LabelsClient initialData={labels} />
    </div>
  );
}
