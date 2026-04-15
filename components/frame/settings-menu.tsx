"use client";

import { useState } from "react";
import { Settings, User } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MyInfoDialog } from "./my-info-dialog";

/**
 * 1depth 좌측 네비게이션 "설정" 아이콘.
 * 클릭 시 팝오버에 "내 정보/권한 설정" 항목을 표출하고,
 * 항목 선택 시 사용자 수정(내 정보) 다이얼로그를 오픈한다.
 */
export function SettingsMenu() {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenMyInfo = () => {
    setPopoverOpen(false);
    setDialogOpen(true);
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex w-full flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors",
                  popoverOpen
                    ? "bg-primary-light text-primary font-semibold"
                    : "text-text-placeholder hover:bg-hover hover:text-text-body"
                )}
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span>설정</span>
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">설정</TooltipContent>
        </Tooltip>

        <PopoverContent side="right" align="start" className="w-52 p-1">
          <p className="text-text-placeholder px-2 py-1 text-xs">설정</p>
          <button
            onClick={handleOpenMyInfo}
            className="hover:bg-hover text-text-body flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm transition-colors"
          >
            <User className="text-text-placeholder h-4 w-4" />내 정보 / 권한 설정
          </button>
        </PopoverContent>
      </Popover>

      <MyInfoDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
