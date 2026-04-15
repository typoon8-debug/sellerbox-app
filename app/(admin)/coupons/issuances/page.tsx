// F017: 쿠폰 발급 조회
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { IssuancesClient } from "@/app/(admin)/coupons/issuances/issuances-client";
import { createClient } from "@/lib/supabase/server";
import { CouponRepository } from "@/lib/repositories/coupon.repository";
import { CouponIssuanceRepository } from "@/lib/repositories/coupon-issuance.repository";
import { CouponRedemptionRepository } from "@/lib/repositories/coupon-redemption.repository";

export default async function CouponsIssuancesPage() {
  // 서버 컴포넌트에서 Supabase 클라이언트 생성
  const supabase = await createClient();

  // 쿠폰 발급 목록 조회
  const issuanceRepo = new CouponIssuanceRepository(supabase);
  const issuanceResult = await issuanceRepo.paginate({ page: 1, pageSize: 50 });

  // 쿠폰 사용 이력 조회
  const redemptionRepo = new CouponRedemptionRepository(supabase);
  const redemptionResult = await redemptionRepo.paginate({ page: 1, pageSize: 50 });

  // 쿠폰 목록 조회 (발급 다이얼로그용)
  const couponRepo = new CouponRepository(supabase);
  const couponsResult = await couponRepo.paginate({ page: 1, pageSize: 100 });

  return (
    <div>
      <PageTitleBar
        title="쿠폰 발급 조회"
        screenNumber="60002"
        breadcrumbs={[{ label: "쿠폰 관리" }, { label: "쿠폰 발급 조회" }]}
      />
      <IssuancesClient
        initialIssuances={issuanceResult.data}
        initialRedemptions={redemptionResult.data}
        coupons={couponsResult.data}
      />
    </div>
  );
}
