// F023: 고객지원 화면 (고객 CS 처리)
export const dynamic = "force-dynamic";

import { PageTitleBar } from "@/components/contents/page-title-bar";
import { CsClient } from "@/app/(admin)/support/cs/cs-client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SellerRepository } from "@/lib/repositories/seller.repository";
import { CsTicketRepository } from "@/lib/repositories/cs-ticket.repository";
import type { CsTicketWithJoins } from "@/lib/types/domain/support";

export default async function SupportCsPage() {
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  const adminSupabase = createAdminClient();

  // 로그인 seller의 소속 가게 목록 조회
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

  // 오늘 기준 초기 OPEN CS 조회 (첫 번째 가게)
  const today = new Date().toISOString().split("T")[0];
  const firstStoreId = stores[0]?.store_id;
  const csRepo = new CsTicketRepository(adminSupabase);

  let initialTickets: CsTicketWithJoins[] = [];
  let initialOpenCount = 0;

  if (firstStoreId) {
    try {
      [initialTickets, initialOpenCount] = await Promise.all([
        csRepo.findByStoreAndDateRange(firstStoreId, today, today, {
          status: "OPEN",
        }),
        csRepo.countOpenByStore(firstStoreId, today, today),
      ]);
    } catch {
      // DB 연결 실패 시 빈 결과
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageTitleBar
        title="고객지원"
        screenNumber="50001"
        breadcrumbs={[{ label: "고객지원" }, { label: "고객지원" }]}
      />
      <CsClient
        stores={stores}
        initialTickets={initialTickets}
        initialOpenCount={initialOpenCount}
        initialFrom={today}
        initialTo={today}
      />
    </div>
  );
}
