"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Columns2, SquareIcon } from "lucide-react";
import { useMdiStore } from "@/lib/stores/mdi-store";
import { toast } from "sonner";

export function ScreenSplitToggle() {
  const { splitActive, tabs, activeTabId, toggleSplit } = useMdiStore();

  const handleClick = () => {
    if (!splitActive) {
      // 분할 가능 여부 체크: active 외 탭이 1개 이상 필요
      const hasOther = tabs.some((t) => t.id !== activeTabId);
      if (!hasOther) {
        toast.info("화면을 분할하려면 탭이 2개 이상 열려 있어야 합니다.");
        return;
      }
    }
    toggleSplit();
  };

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <Button
          variant={splitActive ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleClick}
        >
          {splitActive ? <Columns2 className="h-4 w-4" /> : <SquareIcon className="h-4 w-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {splitActive ? "기본 화면으로 전환" : "화면 분할"}
      </TooltipContent>
    </Tooltip>
  );
}
