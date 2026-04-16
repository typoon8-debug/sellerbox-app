// F013: 가게정보 관리 (배송정보·판매원·바로퀵정책·운행표·슬롯카운트 탭)
export const dynamic = "force-dynamic";

import { PageTitleBar } from "@/components/contents/page-title-bar";
import { StoreInfoClient } from "./store-info-client";

export default function StoresInfoManagePage() {
  return (
    <div>
      <PageTitleBar
        title="가게정보 관리"
        screenNumber="12002"
        breadcrumbs={[{ label: "가게 관리" }, { label: "가게정보 관리" }]}
      />
      <StoreInfoClient
        fulfillments={[]}
        sellers={[]}
        quickPolicies={[]}
        timeslots={[]}
        slotUsages={[]}
      />
    </div>
  );
}
