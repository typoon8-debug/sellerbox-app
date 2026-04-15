"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingPopupProps {
  open: boolean;
  message?: string;
  className?: string;
}

/**
 * 가이드 §12 로딩 팝업
 * - 312×204 고정, icon 62×62, radius 4, outline #A2ACBD
 * - bg #FFFFFF, 16px Bold #353535
 */
export function LoadingPopup({ open, message = "처리 중...", className }: LoadingPopupProps) {
  if (!open) return null;

  return (
    /* 오버레이 */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        className={cn(
          "border-neutral-line bg-control shadow-popup flex flex-col items-center justify-center gap-4 rounded border",
          "h-[204px] w-[312px]",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <Loader2 className="text-primary h-[62px] w-[62px] animate-spin" />
        <p className="text-text-body text-base font-bold">{message}</p>
      </div>
    </div>
  );
}
