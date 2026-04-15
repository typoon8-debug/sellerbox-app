// F016: 쿠폰 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { CouponsClient } from "@/app/(admin)/coupons/coupons-client";
import { createClient } from "@/lib/supabase/server";
import { CouponRepository } from "@/lib/repositories/coupon.repository";

export default async function CouponsPage() {
  // 서버 컴포넌트에서 Supabase 클라이언트 생성
  const supabase = await createClient();
  const repo = new CouponRepository(supabase);

  // 쿠폰 목록 조회
  const result = await repo.paginate({ page: 1, pageSize: 50 });

  return (
    <div>
      <PageTitleBar
        title="쿠폰 관리"
        screenNumber="60001"
        breadcrumbs={[{ label: "쿠폰 관리" }, { label: "쿠폰 관리" }]}
      />
      <CouponsClient initialData={result.data} />
    </div>
  );
}
