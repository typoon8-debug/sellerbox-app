"use client";

import { ChevronsLeft, ChevronsRight, Hash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MainMenuBar } from "./main-menu-bar";
import { SubMenuTree } from "./sub-menu-tree";
import { useLeftPanelStore } from "@/lib/stores/left-panel-store";

export function LeftPanel() {
  const { isSubMenuOpen, showScreenNumbers, toggleSubMenu, toggleScreenNumbers } =
    useLeftPanelStore();

  return (
    <div className="bg-panel border-separator flex shrink-0 overflow-hidden border-r">
      {/* 1depth 메인메뉴바 */}
      <MainMenuBar />

      {/* 2~4depth 서브메뉴 트리 (토글) */}
      {isSubMenuOpen && (
        <div className="flex min-h-0 flex-col overflow-hidden" style={{ width: "184px" }}>
          {/* 상단 제어 버튼 */}
          <div className="border-separator flex h-9 shrink-0 items-center justify-between border-b px-2">
            {/* 화면번호 토글 */}
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleScreenNumbers}
                  className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] transition-colors ${
                    showScreenNumbers
                      ? "bg-primary text-primary-foreground"
                      : "text-text-placeholder hover:bg-hover"
                  }`}
                >
                  <Hash className="h-3 w-3" />
                  화면번호
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">화면번호 표시/숨김</TooltipContent>
            </Tooltip>

            {/* 닫기 버튼 << */}
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleSubMenu}
                  className="text-text-placeholder hover:bg-hover hover:text-text-body rounded p-1 transition-colors"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">서브메뉴 닫기</TooltipContent>
            </Tooltip>
          </div>

          {/* 서브메뉴 트리 */}
          <SubMenuTree />
        </div>
      )}

      {/* 접힌 상태: >> 열기 버튼 */}
      {!isSubMenuOpen && (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={toggleSubMenu}
              className="text-text-placeholder hover:bg-hover hover:text-text-body border-separator flex h-9 w-5 shrink-0 items-center justify-center border-r transition-colors"
            >
              <ChevronsRight className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">서브메뉴 열기</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
