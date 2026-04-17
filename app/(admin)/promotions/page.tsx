// F014+F015: 프로모션 통합 관리 화면
// 검색조건(가게명) → Panel1(프로모션 그리드) → Panel2(좌: 가게상품 / 우: 등록상품)
export const dynamic = "force-dynamic";

import { PageTitleBar } from "@/components/contents/page-title-bar";
import { PromotionsClient } from "@/app/(admin)/promotions/promotions-client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PromotionRepository } from "@/lib/repositories/promotion.repository";
import { SellerRepository } from "@/lib/repositories/seller.repository";

interface PromotionsPageProps {
  searchParams: Promise<{ store_id?: string }>;
}

export default async function PromotionsPage({ searchParams }: PromotionsPageProps) {
  const params = await searchParams;

  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  const adminSupabase = createAdminClient();

  // 로그인 사용자 소속 가게 목록 조회 (OWNER 복수 가게 지원)
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

  // 선택된 가게의 프로모션 목록 조회 (ENDED 제외)
  let initialPromotions: Awaited<ReturnType<PromotionRepository["findByStoreId"]>> = [];
  if (selectedStoreId) {
    const repo = new PromotionRepository(adminSupabase);
    try {
      initialPromotions = await repo.findByStoreId(selectedStoreId);
    } catch {
      initialPromotions = [];
    }
  }

  return (
    <div>
      <PageTitleBar
        title="프로모션 관리"
        screenNumber="30004"
        breadcrumbs={[{ label: "상품관리" }, { label: "프로모션 관리" }]}
      />
      <PromotionsClient
        stores={stores}
        initialStoreId={selectedStoreId}
        initialPromotions={initialPromotions}
      />
    </div>
  );
}
