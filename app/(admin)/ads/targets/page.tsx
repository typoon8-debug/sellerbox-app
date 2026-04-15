// F020: 광고 타겟 - Server Component (실제 Supabase 연동)
import { createClient } from "@/lib/supabase/server";
import { AdTargetRepository } from "@/lib/repositories/ad-target.repository";
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { AdsTargetsClient } from "@/app/(admin)/ads/targets/ads-targets-client";
import type { PaginatedResult } from "@/lib/types/api";
import type { AdTargetRow } from "@/lib/types/domain/advertisement";

interface SearchParams {
  page?: string;
}

export default async function AdsTargetsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const repo = new AdTargetRepository(supabase);

  const page = params.page ? parseInt(params.page, 10) : 1;

  let initialData: PaginatedResult<AdTargetRow>;
  try {
    initialData = await repo.paginate({ page, pageSize: 20 });
  } catch {
    initialData = { data: [], totalCount: 0, hasNextPage: false, page: 1, pageSize: 20 };
  }

  return (
    <div>
      <PageTitleBar
        title="광고 타겟"
        screenNumber="70003"
        breadcrumbs={[{ label: "광고 관리" }, { label: "광고 타겟" }]}
      />
      <AdsTargetsClient initialData={initialData} />
    </div>
  );
}
