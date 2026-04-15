import { TenantContextSelector } from "./tenant-context-selector";
import { SessionCountdown } from "./session-countdown";
import { UserProfileMenu } from "./user-profile-menu";
import { SystemLogo } from "./system-logo";
import { getMyProfile } from "@/lib/actions/profile";

export async function TopBar() {
  const profile = await getMyProfile();

  return (
    <header className="bg-panel border-separator flex h-14 shrink-0 items-center justify-between border-b px-4">
      {/* 좌: 시스템 로고 */}
      <div className="flex items-center gap-3">
        <SystemLogo />
      </div>

      {/* 중: 테넌트 컨텍스트 선택 — 관리자 시스템에서는 레이아웃 유지 + invisible */}
      <div className="invisible flex flex-1 items-center justify-center px-8">
        <TenantContextSelector />
      </div>

      {/* 우: 세션 카운트다운 + 사용자 프로필 */}
      <div className="flex items-center gap-4">
        <SessionCountdown />
        <UserProfileMenu profile={profile} />
      </div>
    </header>
  );
}
