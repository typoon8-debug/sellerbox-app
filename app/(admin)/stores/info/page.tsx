// F013: 가게 정보 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { StoreInfoClient } from "@/app/(admin)/stores/info/store-info-client";

export default function StoresInfoPage() {
  return (
    <div>
      <PageTitleBar
        title="가게 정보 관리"
        screenNumber="12002"
        breadcrumbs={[{ label: "가게 관리" }, { label: "가게 정보 관리" }]}
      />
      <StoreInfoClient />
    </div>
  );
}
