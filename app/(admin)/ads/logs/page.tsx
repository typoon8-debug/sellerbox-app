// F022: 광고 로그 - Server Component (실제 Supabase 연동, 읽기 전용)
import { createClient } from "@/lib/supabase/server";
import { AdLogRepository } from "@/lib/repositories/ad-log.repository";
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { AdsLogsClient } from "@/app/(admin)/ads/logs/ads-logs-client";
import type { PaginatedResult } from "@/lib/types/api";
import type { AdLogRow } from "@/lib/types/domain/advertisement";

interface SearchParams {
  page?: string;
  content_id?: string;
  action?: string;
  date_from?: string;
  date_to?: string;
}

export default async function AdsLogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const repo = new AdLogRepository(supabase);

  const page = params.page ? parseInt(params.page, 10) : 1;

  // 필터 구성
  const filters: Record<string, string> = {};
  if (params.content_id) filters.content_id = params.content_id;
  if (params.action && params.action !== "ALL") filters.action = params.action;

  let initialData: PaginatedResult<AdLogRow>;
  try {
    initialData = await repo.paginate({ page, pageSize: 50, filters });
  } catch {
    initialData = { data: [], totalCount: 0, hasNextPage: false, page: 1, pageSize: 50 };
  }

  return (
    <div>
      <PageTitleBar
        title="광고로그"
        screenNumber="20006"
        breadcrumbs={[{ label: "가게관리" }, { label: "광고로그" }]}
      />
      <AdsLogsClient
        initialData={initialData}
        initialContentId={params.content_id ?? ""}
        initialAction={params.action ?? "ALL"}
      />
    </div>
  );
}
