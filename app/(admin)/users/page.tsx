// 사용자 관리 - 플레이스홀더 (추후 구현 예정)
import { PageTitleBar } from "@/components/contents/page-title-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <div>
      <PageTitleBar
        title="사용자 조회/목록"
        screenNumber="60001"
        breadcrumbs={[{ label: "시스템관리" }, { label: "사용자 조회/목록" }]}
      />
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <EmptyState
          icon={Users}
          title="사용자 관리 기능은 준비 중입니다"
          description="추후 업데이트에서 제공될 예정입니다."
        />
      </div>
    </div>
  );
}
