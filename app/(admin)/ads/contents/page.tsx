// F018: 광고 콘텐츠 - Server Component (실제 Supabase 연동)
import { createClient } from "@/lib/supabase/server";
import { AdContentRepository } from "@/lib/repositories/ad-content.repository";
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { AdsContentsClient } from "@/app/(admin)/ads/contents/ads-contents-client";
import type { PaginatedResult } from "@/lib/types/api";
import type { AdContentRow } from "@/lib/types/domain/advertisement";

interface SearchParams {
  page?: string;
  q?: string;
}

export default async function AdsContentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const repo = new AdContentRepository(supabase);

  const page = params.page ? parseInt(params.page, 10) : 1;

  let initialData: PaginatedResult<AdContentRow>;
  try {
    initialData = await repo.paginate({
      page,
      pageSize: 20,
      search: params.q,
    });
  } catch {
    initialData = { data: [], totalCount: 0, hasNextPage: false, page: 1, pageSize: 20 };
  }

  return (
    <div>
      <PageTitleBar
        title="광고 콘텐츠"
        screenNumber="70001"
        breadcrumbs={[{ label: "광고 관리" }, { label: "광고 콘텐츠" }]}
      />
      <AdsContentsClient initialData={initialData} />
    </div>
  );
}
