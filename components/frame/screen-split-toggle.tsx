"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Rows2, Columns2 } from "lucide-react";
import { useMdiStore } from "@/lib/stores/mdi-store";
import { toast } from "sonner";

export function ScreenSplitToggle() {
  const { splitActive, splitDirection, tabs, activeTabId, toggleSplit, setSplitDirection } =
    useMdiStore();

  const canSplit = tabs.some((t) => t.id !== activeTabId);

  const handleSplit = (direction: "horizontal" | "vertical") => {
    if (splitActive && splitDirection === direction) {
      // 같은 방향 버튼 재클릭 → 분할 해제
      toggleSplit();
      return;
    }
    if (!splitActive) {
      if (!canSplit) {
        toast.info("화면을 분할하려면 탭이 2개 이상 열려 있어야 합니다.");
        return;
      }
      toggleSplit(); // 분할 활성화
    }
    setSplitDirection(direction);
  };

  return (
    <div className="flex items-center">
      {/* 수평 분할 (상/하) */}
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Button
            variant={splitActive && splitDirection === "horizontal" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => handleSplit("horizontal")}
          >
            <Rows2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">수평 분할 (상/하)</TooltipContent>
      </Tooltip>

      {/* 수직 분할 (좌/우) */}
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Button
            variant={splitActive && splitDirection === "vertical" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => handleSplit("vertical")}
          >
            <Columns2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">수직 분할 (좌/우)</TooltipContent>
      </Tooltip>
    </div>
  );
}
