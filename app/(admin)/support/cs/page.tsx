// F023: CS 관리
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { CsClient } from "@/app/(admin)/support/cs/cs-client";

export default function SupportCsPage() {
  return (
    <div>
      <PageTitleBar
        title="CS 관리"
        screenNumber="80001"
        breadcrumbs={[{ label: "고객 지원" }, { label: "CS 관리" }]}
      />
      <CsClient />
    </div>
  );
}
