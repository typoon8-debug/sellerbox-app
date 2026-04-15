// 감사 로그 대시보드 — 읽기 전용 (Server Component)
import { createClient } from "@/lib/supabase/server";
import { AuditLogRepository } from "@/lib/repositories/audit-log.repository";
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { AuditClient } from "@/app/(admin)/audit/audit-client";
import type { PaginatedResult } from "@/lib/types/api";
import type { Database } from "@/lib/supabase/database.types";

type AuditLogRow = Database["public"]["Tables"]["audit_log"]["Row"];

interface SearchParams {
  page?: string;
  q?: string;
}

export default async function AuditPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const repo = new AuditLogRepository(supabase);

  const page = params.page ? parseInt(params.page, 10) : 1;

  let initialData: PaginatedResult<AuditLogRow>;
  try {
    initialData = await repo.paginate({
      page,
      pageSize: 30,
      search: params.q,
    });
  } catch {
    initialData = { data: [], totalCount: 0, hasNextPage: false, page: 1, pageSize: 30 };
  }

  return (
    <div>
      <PageTitleBar
        title="감사 로그"
        screenNumber="90010"
        breadcrumbs={[{ label: "시스템" }, { label: "감사 로그" }]}
      />
      <AuditClient initialData={initialData} initialSearch={params.q ?? ""} />
    </div>
  );
}
