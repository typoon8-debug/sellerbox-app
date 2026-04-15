// F001: 상품 관리
// searchParams 사용 → 요청마다 서버 렌더링 (동적 데이터)
export const dynamic = "force-dynamic";

import { PageTitleBar } from "@/components/contents/page-title-bar";
import { ItemsClient } from "@/app/(admin)/items/items-client";
import { createClient } from "@/lib/supabase/server";
import { ItemRepository } from "@/lib/repositories/item.repository";

interface ItemsPageProps {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>;
}

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  // searchParams는 Next.js 15에서 Promise
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.q ?? "";
  const category = params.category;

  const supabase = await createClient();
  const repo = new ItemRepository(supabase);

  // 카테고리 필터 적용
  const filters = category && category !== "ALL" ? { category_code_value: category } : undefined;

  const initialData = await repo.paginate({ page, pageSize: 20, search, filters });

  return (
    <div>
      <PageTitleBar
        title="상품 관리"
        screenNumber="11001"
        breadcrumbs={[{ label: "상품 관리" }, { label: "상품 조회/목록" }]}
      />
      <ItemsClient initialData={initialData} />
    </div>
  );
}
