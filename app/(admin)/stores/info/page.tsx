// F013: 가게 정보 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { StoreInfoClient } from "@/app/(admin)/stores/info/store-info-client";
import { createClient } from "@/lib/supabase/server";
import { StoreFulfillmentRepository } from "@/lib/repositories/store-fulfillment.repository";
import { SellerRepository } from "@/lib/repositories/seller.repository";
import { StoreQuickPolicyRepository } from "@/lib/repositories/store-quick-policy.repository";
import { StoreQuickTimeslotRepository } from "@/lib/repositories/store-quick-timeslot.repository";
import { StoreQuickSlotUsageRepository } from "@/lib/repositories/store-quick-slot-usage.repository";

interface StoresInfoPageProps {
  searchParams: Promise<{ store_id?: string }>;
}

export default async function StoresInfoPage({ searchParams }: StoresInfoPageProps) {
  const params = await searchParams;
  // store_id가 없으면 빈 데이터로 렌더링
  const storeId = params.store_id;

  const supabase = await createClient();

  const fulfillmentRepo = new StoreFulfillmentRepository(supabase);
  const sellerRepo = new SellerRepository(supabase);
  const quickPolicyRepo = new StoreQuickPolicyRepository(supabase);
  const timeslotRepo = new StoreQuickTimeslotRepository(supabase);
  const slotUsageRepo = new StoreQuickSlotUsageRepository(supabase);

  // store_id 필터로 각 탭 데이터 조회
  const filters = storeId ? { store_id: storeId } : undefined;

  const [fulfillments, sellers, quickPolicies, timeslots, slotUsages] = await Promise.all([
    fulfillmentRepo.paginate({ page: 1, pageSize: 100, filters }),
    sellerRepo.paginate({ page: 1, pageSize: 100, filters }),
    quickPolicyRepo.paginate({ page: 1, pageSize: 100, filters }),
    timeslotRepo.paginate({ page: 1, pageSize: 100, filters }),
    slotUsageRepo.paginate({ page: 1, pageSize: 100, filters }),
  ]);

  return (
    <div>
      <PageTitleBar
        title="가게 정보 관리"
        screenNumber="12002"
        breadcrumbs={[{ label: "가게 관리" }, { label: "가게 정보 관리" }]}
      />
      <StoreInfoClient
        fulfillments={fulfillments.data}
        sellers={sellers.data}
        quickPolicies={quickPolicies.data}
        timeslots={timeslots.data}
        slotUsages={slotUsages.data}
      />
    </div>
  );
}
