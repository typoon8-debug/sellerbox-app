// F012: 가게 조회/목록
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { StoresClient } from "@/app/(admin)/stores/stores-client";

export default function StoresPage() {
  return (
    <div>
      <PageTitleBar
        title="가게 관리"
        screenNumber="12001"
        breadcrumbs={[{ label: "가게 관리" }, { label: "가게 조회/목록" }]}
      />
      <StoresClient />
    </div>
  );
}
