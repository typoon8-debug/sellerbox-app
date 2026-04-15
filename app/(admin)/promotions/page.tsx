// F014: 프로모션 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { PromotionsClient } from "@/app/(admin)/promotions/promotions-client";
import { createClient } from "@/lib/supabase/server";
import { PromotionRepository } from "@/lib/repositories/promotion.repository";

interface SearchParams {
  status?: string;
  type?: string;
  from?: string;
  to?: string;
}

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // 서버 컴포넌트에서 Supabase 클라이언트 생성
  const supabase = await createClient();
  const repo = new PromotionRepository(supabase);

  // 날짜/유형/상태 필터 적용
  const params = await searchParams;
  const filters: Record<string, string> = {};
  if (params.status && params.status !== "ALL") filters.status = params.status;
  if (params.type && params.type !== "ALL") filters.type = params.type;

  const result = await repo.paginate({ page: 1, pageSize: 50, filters });

  return (
    <div>
      <PageTitleBar
        title="프로모션 관리"
        screenNumber="50001"
        breadcrumbs={[{ label: "프로모션" }, { label: "프로모션 관리" }]}
      />
      <PromotionsClient initialData={result.data} />
    </div>
  );
}
