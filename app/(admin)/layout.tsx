import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { TopBar } from "@/components/frame/top-bar";
import { LeftPanel } from "@/components/frame/left-panel";
import { MdiTabBar } from "@/components/frame/mdi-tab-bar";
import { AdminShell } from "@/components/frame/admin-shell";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // seller 테이블에서 role 조회 (PICKER/PACKER 경로 접근 제한)
  const { data: seller } = await supabase
    .from("seller")
    .select("role")
    .eq("email", user.email!)
    .maybeSingle();

  if (seller) {
    const h = await headers();
    const pathname = h.get("x-pathname") ?? "/";

    if (seller.role === "PICKER" && !pathname.startsWith("/orders/picking")) {
      redirect("/orders/picking");
    }
    if (seller.role === "PACKER" && !pathname.startsWith("/orders/packing")) {
      redirect("/orders/packing");
    }
  }

  return (
    // useSearchParams() 사용을 위해 Suspense 경계 필요 (Next.js 15 요구사항)
    <Suspense>
      <AdminShell topBar={<TopBar />} leftPanel={<LeftPanel />} mdiTabBar={<MdiTabBar />}>
        {children}
      </AdminShell>
    </Suspense>
  );
}
