"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMdiStore } from "@/lib/stores/mdi-store";

interface MdiContentAreaProps {
  children: ReactNode;
}

/**
 * MDI 콘텐츠 렌더러.
 * - splitActive=false: children(현재 라우트) 만 표시
 * - splitActive=true && horizontal: 상/하 분할 (flex-col)
 * - splitActive=true && vertical: 좌/우 분할 (flex-row)
 */
export function MdiContentArea({ children }: MdiContentAreaProps) {
  const { splitActive, splitDirection, secondaryTabId, tabs } = useMdiStore();
  const secondaryTab = tabs.find((t) => t.id === secondaryTabId);

  if (splitActive && secondaryTab?.href) {
    // iframe 은 admin layout 의 chrome(Top/Left/MDI) 을 제거한 embed 모드로 로드
    const embedHref = secondaryTab.href.includes("?")
      ? `${secondaryTab.href}&embed=1`
      : `${secondaryTab.href}?embed=1`;

    const isVertical = splitDirection === "vertical";

    return (
      <div
        className={cn(
          "divide-separator flex h-full min-h-0 flex-1 overflow-hidden",
          isVertical ? "flex-row divide-x" : "flex-col divide-y"
        )}
      >
        {/* 첫 번째 패널 — 현재 활성 라우트 */}
        <div className="bg-background min-h-0 min-w-0 flex-1 overflow-auto">{children}</div>
        {/* 두 번째 패널 — secondary 탭을 iframe(embed 모드) 으로 렌더 */}
        <div className="bg-background min-h-0 min-w-0 flex-1 overflow-hidden">
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
