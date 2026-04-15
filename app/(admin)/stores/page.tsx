// F012: 가게 조회/목록
// searchParams 사용 → 요청마다 서버 렌더링 (동적 데이터)
export const dynamic = "force-dynamic";

import { PageTitleBar } from "@/components/contents/page-title-bar";
import { StoresClient } from "@/app/(admin)/stores/stores-client";
import { createClient } from "@/lib/supabase/server";
import { StoreRepository } from "@/lib/repositories/store.repository";

interface StoresPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function StoresPage({ searchParams }: StoresPageProps) {
  // searchParams는 Next.js 15에서 Promise
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.q ?? "";

  const supabase = await createClient();
  const repo = new StoreRepository(supabase);
  const initialData = await repo.paginate({ page, pageSize: 20, search });

  return (
    <div>
      <PageTitleBar
        title="가게 관리"
        screenNumber="12001"
        breadcrumbs={[{ label: "가게 관리" }, { label: "가게 조회/목록" }]}
      />
      <StoresClient initialData={initialData} />
    </div>
  );
}
