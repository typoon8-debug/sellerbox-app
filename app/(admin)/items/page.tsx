// F001: 상품 관리
// searchParams 사용 → 요청마다 서버 렌더링 (동적 데이터)
export const dynamic = "force-dynamic";

import { PageTitleBar } from "@/components/contents/page-title-bar";
import { ItemsClient } from "@/app/(admin)/items/items-client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ItemRepository } from "@/lib/repositories/item.repository";
import { SellerRepository } from "@/lib/repositories/seller.repository";

interface ItemsPageProps {
  searchParams: Promise<{ q?: string; page?: string; category?: string; store_id?: string }>;
}

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.q ?? "";
  const category = params.category;

  // 세션 기반 로그인 사용자 email 조회
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  const adminSupabase = createAdminClient();

  // 로그인한 seller의 소속 가게 목록 조회 (tenant_code 포함 — 카테고리 로드에 사용)
  let stores: { store_id: string; name: string; tenant_code: string }[] = [];
  if (user?.email) {
    const sellerRepo = new SellerRepository(adminSupabase);
    const sellers = await sellerRepo.findByEmail(user.email);
    const storeIds = [...new Set(sellers.map((s) => s.store_id).filter(Boolean))] as string[];

    if (storeIds.length > 0) {
      const { data: storeRows } = await adminSupabase
        .from("store")
        .select("store_id, name, tenant_id")
        .in("store_id", storeIds)
        .order("name", { ascending: true });

      const tenantIds = [...new Set((storeRows ?? []).map((s) => s.tenant_id))];
      const { data: tenantRows } = await adminSupabase
        .from("tenant")
        .select("tenant_id, code")
        .in("tenant_id", tenantIds);

      const tenantMap = new Map((tenantRows ?? []).map((t) => [t.tenant_id, t.code]));

      stores = (storeRows ?? []).map((s) => ({
        store_id: s.store_id,
        name: s.name,
        tenant_code: tenantMap.get(s.tenant_id) ?? "",
      }));
    }
  }

  const selectedStoreId = params.store_id ?? stores[0]?.store_id ?? "";

  // store_id가 없으면 빈 데이터 반환 (store_id 필터 없는 전체 조회 방지)
  let initialData;
  if (!selectedStoreId) {
    initialData = { data: [], totalCount: 0, hasNextPage: false, page, pageSize: 20 };
  } else {
    const repo = new ItemRepository(adminSupabase);
    const filters: Record<string, string> = { store_id: selectedStoreId };
    if (category && category !== "ALL") filters.category_code_value = category;
    initialData = await repo.paginate({ page, pageSize: 20, search, filters });
  }

  return (
    <div>
      <PageTitleBar
        title="상품 조회/목록"
        screenNumber="30001"
        breadcrumbs={[{ label: "상품관리" }, { label: "상품 조회/목록" }]}
      />
      <ItemsClient initialData={initialData} stores={stores} initialStoreId={selectedStoreId} />
    </div>
  );
}
