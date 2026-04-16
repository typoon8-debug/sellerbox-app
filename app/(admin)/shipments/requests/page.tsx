// F007: 배송 요청 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { RequestsClient } from "@/app/(admin)/shipments/requests/requests-client";
import { createClient } from "@/lib/supabase/server";
import { DispatchRequestRepository } from "@/lib/repositories/dispatch-request.repository";

export default async function ShipmentsRequestsPage() {
  // 서버 컴포넌트에서 Supabase 클라이언트 생성
  const supabase = await createClient();
  const repo = new DispatchRequestRepository(supabase);

  // 배송 요청 목록 페이지네이션 조회
  const result = await repo.paginate({ page: 1, pageSize: 50 });

  return (
    <div>
      <PageTitleBar
        title="배송 요청 관리"
        screenNumber="40005"
        breadcrumbs={[{ label: "주문배송" }, { label: "배송 요청 관리" }]}
      />
      <RequestsClient initialData={result.data} />
    </div>
  );
}
