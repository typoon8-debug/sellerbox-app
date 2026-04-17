// F018+F019+F020+F021+F022: 광고 통합 관리 화면
// 검색조건(가게명) → Panel1(광고콘텐츠 그리드) → Panel2(일정·타겟·로그 탭)
export const dynamic = "force-dynamic";

import { PageTitleBar } from "@/components/contents/page-title-bar";
import { AdsContentsClient } from "@/app/(admin)/ads/contents/ads-contents-client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdContentRepository } from "@/lib/repositories/ad-content.repository";
import { SellerRepository } from "@/lib/repositories/seller.repository";

interface AdsContentsPageProps {
  searchParams: Promise<{ store_id?: string }>;
}

export default async function AdsContentsPage({ searchParams }: AdsContentsPageProps) {
  const params = await searchParams;

  // 세션 기반 로그인 사용자 email → 소속 가게 목록 조회
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

  // store_id가 없으면 빈 데이터
  let initialContents: Awaited<ReturnType<AdContentRepository["findByStoreId"]>> = [];
  if (selectedStoreId) {
    const repo = new AdContentRepository(adminSupabase);
    try {
      initialContents = await repo.findByStoreId(selectedStoreId);
    } catch {
      initialContents = [];
    }
  }

  return (
    <div>
      <PageTitleBar
        title="광고콘텐츠"
        screenNumber="20003"
        breadcrumbs={[{ label: "가게관리" }, { label: "광고콘텐츠" }]}
      />
      <AdsContentsClient
        stores={stores}
        initialStoreId={selectedStoreId}
        initialContents={initialContents}
      />
    </div>
  );
}
