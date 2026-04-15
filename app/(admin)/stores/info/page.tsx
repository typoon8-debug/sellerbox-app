// F013: 가게 정보 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";

export default function StoresInfoPage() {
  return (
    <div>
      <PageTitleBar
        title="가게 정보 관리"
        screenNumber="12002"
        breadcrumbs={[{ label: "가게 관리" }, { label: "가게 정보 관리" }]}
      />
      <div className="p-6">
        {/* TODO: 배송정보·판매원·바로퀵정책·운행표·슬롯예약카운트 탭 (Phase 2) */}
      </div>
    </div>
  );
}
