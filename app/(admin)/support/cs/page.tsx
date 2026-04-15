// F023: CS 관리 - Server Component (실제 Supabase 연동)
import { createClient } from "@/lib/supabase/server";
import { CsTicketRepository } from "@/lib/repositories/cs-ticket.repository";
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { CsClient } from "@/app/(admin)/support/cs/cs-client";
import type { PaginatedResult } from "@/lib/types/api";
import type { CsTicketRow } from "@/lib/types/domain/support";

interface SearchParams {
  type?: string;
  status?: string;
  page?: string;
}

export default async function SupportCsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const repo = new CsTicketRepository(supabase);

  // 필터 구성
  const filters: Record<string, string> = {};
  if (params.type && params.type !== "ALL") filters.type = params.type;
  if (params.status && params.status !== "ALL") filters.status = params.status;

  const page = params.page ? parseInt(params.page, 10) : 1;

  let initialData: PaginatedResult<CsTicketRow>;
  try {
    initialData = await repo.paginate({ page, pageSize: 20, filters });
  } catch {
    // DB 연결 실패 시 빈 결과 반환
    initialData = { data: [], totalCount: 0, hasNextPage: false, page: 1, pageSize: 20 };
  }

  return (
    <div>
      <PageTitleBar
        title="CS 관리"
        screenNumber="80001"
        breadcrumbs={[{ label: "고객 지원" }, { label: "CS 관리" }]}
      />
      <CsClient
        initialData={initialData}
        initialType={params.type ?? "ALL"}
        initialStatus={params.status ?? "ALL"}
      />
    </div>
  );
}
