// F016+F017: 쿠폰 통합 관리 화면
// 검색조건(가게명) → Panel1(쿠폰 그리드) → Panel2(발급·사용 탭)
export const dynamic = "force-dynamic";

import { PageTitleBar } from "@/components/contents/page-title-bar";
import { CouponsClient } from "@/app/(admin)/coupons/coupons-client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CouponRepository } from "@/lib/repositories/coupon.repository";
import { SellerRepository } from "@/lib/repositories/seller.repository";

interface CouponsPageProps {
  searchParams: Promise<{ store_id?: string }>;
}

export default async function CouponsPage({ searchParams }: CouponsPageProps) {
  const params = await searchParams;

  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  const adminSupabase = createAdminClient();

  let stores: { store_id: string; name: string }[] = [];
  if (user?.email) {
    const sellerRepo = new SellerRepository(adminSupabase);
    const sellers = await sellerRepo.findByEmail(user.email);
    const storeIds = [...new Set(sellers.map((s) => s.store_id).filter(Boolean))] as string[];

    if (storeIds.length > 0) {
      const { data: storeRows } = await adminSupabase
        .from("store")
        .select("store_id, name")
        .in("store_id", storeIds)
        .order("name", { ascending: true });
      stores = (storeRows ?? []) as { store_id: string; name: string }[];
    }
  }

  const selectedStoreId = params.store_id ?? stores[0]?.store_id ?? "";

  let initialCoupons: Awaited<ReturnType<CouponRepository["findByStoreId"]>> = [];
  if (selectedStoreId) {
    const repo = new CouponRepository(adminSupabase);
    try {
      initialCoupons = await repo.findByStoreId(selectedStoreId);
    } catch {
      initialCoupons = [];
    }
  }

  return (
    <div>
      <PageTitleBar
        title="쿠폰관리"
        screenNumber="20007"
        breadcrumbs={[{ label: "가게관리" }, { label: "쿠폰관리" }]}
      />
      <CouponsClient
        stores={stores}
        initialStoreId={selectedStoreId}
        initialCoupons={initialCoupons}
      />
    </div>
  );
}
