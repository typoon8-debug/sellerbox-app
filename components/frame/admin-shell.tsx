"use client";

import { type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { MdiContentArea } from "./mdi-content-area";

interface AdminShellProps {
  topBar: ReactNode;
  leftPanel: ReactNode;
  mdiTabBar: ReactNode;
  children: ReactNode;
}

/**
 * 관리자 레이아웃 셸.
 * `?embed=1` 쿼리가 있을 때(iframe 내부 렌더링) Top/Left/MDI 크롬을 생략하고
 * 콘텐츠만 렌더한다. 화면 분할 모드에서 secondary iframe 이 사용한다.
 */
export function AdminShell({ topBar, leftPanel, mdiTabBar, children }: AdminShellProps) {
  const searchParams = useSearchParams();
  const embed = searchParams?.get("embed") === "1";

  if (embed) {
    // iframe 임베드 모드: 크롬 없이 콘텐츠만
    return <main className="bg-background min-h-screen w-full overflow-auto">{children}</main>;
  }

  return (
    <div className="flex h-screen min-w-[1280px] flex-col overflow-hidden">
      {topBar}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {leftPanel}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {mdiTabBar}
          <MdiContentArea>{children}</MdiContentArea>
        </div>
      </div>
    </div>
  );
}
