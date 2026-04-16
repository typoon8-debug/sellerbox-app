// F021: 광고 한도 - Server Component (실제 Supabase 연동)
import { createClient } from "@/lib/supabase/server";
import { AdCapRepository } from "@/lib/repositories/ad-cap.repository";
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { AdsCapsClient } from "@/app/(admin)/ads/caps/ads-caps-client";
import type { PaginatedResult } from "@/lib/types/api";
import type { AdCapRow } from "@/lib/types/domain/advertisement";

interface SearchParams {
  page?: string;
}

export default async function AdsCapsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const repo = new AdCapRepository(supabase);

  const page = params.page ? parseInt(params.page, 10) : 1;

  let initialData: PaginatedResult<AdCapRow>;
  try {
    initialData = await repo.paginate({ page, pageSize: 20 });
  } catch {
    initialData = { data: [], totalCount: 0, hasNextPage: false, page: 1, pageSize: 20 };
  }

  return (
    <div>
      <PageTitleBar
        title="광고한도"
        screenNumber="20005"
        breadcrumbs={[{ label: "가게관리" }, { label: "광고한도" }]}
      />
      <AdsCapsClient initialData={initialData} />
    </div>
  );
}
