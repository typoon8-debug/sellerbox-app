// F019: 광고 일정 - Server Component (실제 Supabase 연동)
import { createClient } from "@/lib/supabase/server";
import { AdScheduleRepository } from "@/lib/repositories/ad-schedule.repository";
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { AdsSchedulesClient } from "@/app/(admin)/ads/schedules/ads-schedules-client";
import type { PaginatedResult } from "@/lib/types/api";
import type { AdScheduleRow } from "@/lib/types/domain/advertisement";

interface SearchParams {
  page?: string;
}

export default async function AdsSchedulesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const repo = new AdScheduleRepository(supabase);

  const page = params.page ? parseInt(params.page, 10) : 1;

  let initialData: PaginatedResult<AdScheduleRow>;
  try {
    initialData = await repo.paginate({ page, pageSize: 20 });
  } catch {
    initialData = { data: [], totalCount: 0, hasNextPage: false, page: 1, pageSize: 20 };
  }

  return (
    <div>
      <PageTitleBar
        title="광고 일정"
        screenNumber="70002"
        breadcrumbs={[{ label: "광고 관리" }, { label: "광고 일정" }]}
      />
      <AdsSchedulesClient initialData={initialData} />
    </div>
  );
}
