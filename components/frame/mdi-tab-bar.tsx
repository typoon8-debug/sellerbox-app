"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ScreenSplitToggle } from "./screen-split-toggle";
import { TabMenuList } from "./tab-menu-list";
import { useMdiStore, type MdiTab } from "@/lib/stores/mdi-store";
import { useHotkeyMap } from "@/lib/hooks/use-hotkey";

function MdiTabItem({
  tab,
  isActive,
  onFocus,
  onClose,
}: {
  tab: MdiTab;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
}) {
  const isHome = tab.id === "home";

  return (
    <div
      role="tab"
      aria-selected={isActive}
      className={cn(
        "group border-separator relative flex h-full shrink-0 cursor-pointer items-center gap-1.5 border-r px-3 text-sm transition-colors select-none",
        isActive
          ? "border-b-primary bg-background text-text-body border-b-2 font-medium"
          : "bg-panel text-text-placeholder hover:bg-hover hover:text-text-body"
      )}
      onClick={onFocus}
    >
      {isHome && <Home className="h-3.5 w-3.5 shrink-0" />}
      <span className="max-w-[14ch] truncate">{tab.title}</span>
      {tab.dirty && (
        <span className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" title="미저장" />
      )}
      {!isHome && (
        <button
          className="hover:bg-hover shrink-0 rounded p-0.5 opacity-50 transition-opacity hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="탭 닫기"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export function MdiTabBar() {
  const router = useRouter();
  const { tabs, activeTabId, focusTab, closeTab, forceCloseTab } = useMdiStore();
  const [pendingCloseId, setPendingCloseId] = useState<string | null>(null);

  const handleFocus = (tab: MdiTab) => {
    focusTab(tab.id);
    if (tab.href) router.push(tab.href);
  };

  const handleClose = (id: string) => {
    const success = closeTab(id);
    if (!success) {
      setPendingCloseId(id); // dirty — 확인 다이얼로그 오픈
    }
  };

  const handleConfirmClose = () => {
    if (pendingCloseId) {
      forceCloseTab(pendingCloseId);
      setPendingCloseId(null);
    }
  };

  // ─── 키보드 단축키 ─────────────────────────────────────────────────────────
  // Ctrl+W: 현재 활성 탭 닫기 (홈 탭 제외)
  // Ctrl+1~9: 해당 인덱스 탭으로 이동
  const hotkeyMap: Record<string, () => void> = {
    "ctrl+w": () => {
      if (activeTabId !== "home") handleClose(activeTabId);
    },
  };
  for (let n = 1; n <= 9; n++) {
    const idx = n - 1;
    hotkeyMap[`ctrl+${n}`] = () => {
      const target = tabs[idx];
      if (target) handleFocus(target);
    };
  }
  useHotkeyMap(hotkeyMap);

  return (
    <>
      <div className="bg-panel border-separator flex h-10 shrink-0 items-stretch border-b">
        {/* 탭 목록 */}
        <div className="flex min-w-0 flex-1 items-stretch overflow-hidden">
          <ScrollArea className="w-full" type="scroll">
            <div className="flex h-10 items-stretch">
              {tabs.map((tab) => (
                <MdiTabItem
                  key={tab.id}
                  tab={tab}
                  isActive={activeTabId === tab.id}
                  onFocus={() => handleFocus(tab)}
                  onClose={() => handleClose(tab.id)}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-1" />
          </ScrollArea>
        </div>

        {/* 우측 버튼 영역 */}
        <div className="border-separator flex shrink-0 items-center gap-0.5 border-l px-1">
          <ScreenSplitToggle />
          <TabMenuList />
        </div>
      </div>

      {/* 미저장 확인 다이얼로그 */}
      <AlertDialog
        open={!!pendingCloseId}
        onOpenChange={(open) => !open && setPendingCloseId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>저장하지 않고 닫으시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              저장하지 않은 데이터가 있습니다. 탭을 닫으면 변경 사항이 사라집니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingCloseId(null)}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose} variant="destructive">
              닫기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
