import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { TopBar } from "@/components/frame/top-bar";
import { LeftPanel } from "@/components/frame/left-panel";
import { MdiTabBar } from "@/components/frame/mdi-tab-bar";
import { AdminShell } from "@/components/frame/admin-shell";
import { SessionHydrator } from "@/components/frame/session-hydrator";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SellerRepository } from "@/lib/repositories/seller.repository";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminSupabase = createAdminClient();
  const sellerRepo = new SellerRepository(adminSupabase);

  // 로그인 사용자의 seller 목록 조회
  const sellers = user.email ? await sellerRepo.findByEmail(user.email) : [];
  const firstSeller = sellers[0] ?? null;

  // seller 소속 가게 목록 조회 + tenant_id 포함
  const storeIds = [...new Set(sellers.map((s) => s.store_id).filter(Boolean))] as string[];
  let stores: { store_id: string; tenant_id: string | null; name: string }[] = [];
  if (storeIds.length > 0) {
    const { data: storeRows } = await adminSupabase
      .from("store")
      .select("store_id, tenant_id, name")
      .in("store_id", storeIds)
      .order("name", { ascending: true });
    stores = (storeRows ?? []) as { store_id: string; tenant_id: string | null; name: string }[];
  }

  const firstStore = stores[0] ?? null;

  // PICKER/PACKER 경로 접근 제한
  if (firstSeller) {
    const h = await headers();
    const pathname = h.get("x-pathname") ?? "/";

    if (firstSeller.role === "PICKER" && !pathname.startsWith("/orders/picking")) {
      redirect("/orders/picking");
    }
    if (firstSeller.role === "PACKER" && !pathname.startsWith("/orders/packing")) {
      redirect("/orders/packing");
    }
  }

  return (
    // useSearchParams() 사용을 위해 Suspense 경계 필요 (Next.js 15 요구사항)
    <Suspense>
      <SessionHydrator
        sellerId={firstSeller?.seller_id ?? null}
        storeId={firstStore?.store_id ?? null}
        tenantId={firstStore?.tenant_id ?? null}
        stores={stores}
      />
      <AdminShell topBar={<TopBar />} leftPanel={<LeftPanel />} mdiTabBar={<MdiTabBar />}>
        {children}
      </AdminShell>
    </Suspense>
  );
}
