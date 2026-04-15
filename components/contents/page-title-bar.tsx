"use client";

import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Star, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BreadcrumbEntry {
  label: string;
  href?: string;
}

interface PageTitleBarProps {
  title: string;
  screenNumber?: string;
  breadcrumbs?: BreadcrumbEntry[];
}

export function PageTitleBar({ title, screenNumber, breadcrumbs = [] }: PageTitleBarProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteToggle = () => {
    setIsFavorite((prev) => !prev);
    toast.success(isFavorite ? "즐겨찾기에서 제거했습니다." : "즐겨찾기에 추가했습니다.");
  };

  return (
    <div className="bg-control border-separator flex min-w-0 items-center justify-between gap-4 border-b px-6 py-3">
      {/* 좌: 화면 타이틀 + 화면번호 */}
      <div className="flex min-w-0 items-baseline gap-2">
        <h1 className="text-text-body truncate text-base font-semibold">{title}</h1>
        {screenNumber && <span className="text-text-placeholder text-xs">{screenNumber}</span>}
      </div>

      {/* 우: 브레드크럼 + 즐겨찾기 + 도움말 */}
      <div className="flex shrink-0 items-center gap-3">
        {breadcrumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">관리자</BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.map((crumb, idx) => (
                <span key={idx} className="flex items-center gap-1.5">
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {idx === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href ?? "#"}>{crumb.label}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </span>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={handleFavoriteToggle}
              className="hover:bg-hover rounded p-1 transition-colors"
              aria-label="즐겨찾기"
            >
              <Star
                className={cn(
                  "h-4 w-4 transition-colors",
                  isFavorite ? "fill-primary text-primary" : "text-text-placeholder"
                )}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent>즐겨찾기 {isFavorite ? "제거" : "추가"}</TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={() => toast.info("도움말 기능은 Phase 3에서 구현 예정입니다.")}
              className="hover:bg-hover rounded p-1 transition-colors"
              aria-label="도움말"
            >
              <HelpCircle className="text-text-placeholder h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>도움말</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
