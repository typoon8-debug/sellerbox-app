import { Suspense } from "react";
import { redirect } from "next/navigation";
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
  return (
    // useSearchParams() 사용을 위해 Suspense 경계 필요 (Next.js 15 요구사항)
    <Suspense>
      <AdminShell topBar={<TopBar />} leftPanel={<LeftPanel />} mdiTabBar={<MdiTabBar />}>
        {children}
      </AdminShell>
    </Suspense>
  );
}
