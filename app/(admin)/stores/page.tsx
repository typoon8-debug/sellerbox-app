// F012: 가게 관리 (테넌트 → 가게 → 가게정보 마스터-디테일 구조)
export const dynamic = "force-dynamic";

import { PageTitleBar } from "@/components/contents/page-title-bar";
import { StoresClient } from "@/app/(admin)/stores/stores-client";
import { createClient } from "@/lib/supabase/server";
import { TenantRepository } from "@/lib/repositories/tenant.repository";

interface StoresPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function StoresPage({ searchParams }: StoresPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.q ?? "";

  const supabase = await createClient();
  const tenantRepo = new TenantRepository(supabase);
  const initialTenants = await tenantRepo.paginate({ page, pageSize: 100, search });

  return (
    <div>
      <PageTitleBar
        title="가게 관리"
        screenNumber="12001"
        breadcrumbs={[{ label: "가게 관리" }, { label: "가게정보" }]}
      />
      <StoresClient initialTenants={initialTenants} />
    </div>
  );
}
