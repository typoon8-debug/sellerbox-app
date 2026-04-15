// F008: 바로퀵 마감
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { QuickClosingClient } from "@/app/(admin)/shipments/quick-closing/quick-closing-client";
import { createClient } from "@/lib/supabase/server";
import { StoreQuickSlotUsageRepository } from "@/lib/repositories/store-quick-slot-usage.repository";

export default async function ShipmentsQuickClosingPage() {
  // 서버 컴포넌트에서 Supabase 클라이언트 생성
  const supabase = await createClient();
  const repo = new StoreQuickSlotUsageRepository(supabase);

  // 바로퀵 슬롯 사용량 목록 조회
  const result = await repo.paginate({ page: 1, pageSize: 50 });

  return (
    <div>
      <PageTitleBar
        title="바로퀵 마감"
        screenNumber="41002"
        breadcrumbs={[{ label: "배송 관리" }, { label: "바로퀵 마감" }]}
      />
      <QuickClosingClient initialSlots={result.data} />
    </div>
  );
}
