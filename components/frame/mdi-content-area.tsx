"use client";

import { type ReactNode } from "react";
import { useMdiStore } from "@/lib/stores/mdi-store";

interface MdiContentAreaProps {
  children: ReactNode;
}

/**
 * MDI 콘텐츠 렌더러.
 * - splitActive=false: children(현재 라우트) 만 표시
 * - splitActive=true: 좌측 children + 우측 iframe(secondaryTab 경로)
 */
export function MdiContentArea({ children }: MdiContentAreaProps) {
  const { splitActive, secondaryTabId, tabs } = useMdiStore();
  const secondaryTab = tabs.find((t) => t.id === secondaryTabId);

  if (splitActive && secondaryTab?.href) {
    // iframe 은 admin layout 의 chrome(Top/Left/MDI) 을 제거한 embed 모드로 로드
    const embedHref = secondaryTab.href.includes("?")
      ? `${secondaryTab.href}&embed=1`
      : `${secondaryTab.href}?embed=1`;

    return (
      <div className="divide-separator flex h-full min-h-0 flex-1 divide-x overflow-hidden">
        {/* 좌측 — 현재 활성 라우트 */}
        <div className="bg-background min-w-0 flex-1 overflow-auto">{children}</div>
        {/* 우측 — secondary 탭을 iframe(embed 모드) 으로 렌더 */}
        <div className="bg-background min-w-0 flex-1 overflow-hidden">
          <iframe
            key={embedHref}
            src={embedHref}
            className="h-full w-full border-none"
            title={secondaryTab.title}
          />
        </div>
      </div>
    );
  }

  return <div className="bg-background flex-1 overflow-auto">{children}</div>;
}
