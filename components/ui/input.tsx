import * as React from "react";

import { cn } from "@/lib/utils";

/* 가이드 §4 인풋 규격
 * h-8(32px), radius-4, px-3(12px), outline 1px #A2ACBD
 * Hover: outline #2E85FF 만 변경
 * Required: bg #FFFAD2 (data-required="true" 또는 aria-required="true")
 * Disabled: bg #E5E5E5, icon #D4D4D4, font 색상 유지 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // 기본 레이아웃 · 크기
          "flex h-8 w-full rounded border px-3 text-sm",
          // 기본 색상 (Normal 상태)
          "border-neutral-line bg-control text-text-body",
          // placeholder
          "placeholder:text-text-placeholder",
          // Hover: outline 색상만 변경
          "hover:border-primary",
          // Focus
          "focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[2px] focus-visible:outline-none",
          // Required: bg #FFFAD2
          "aria-[required=true]:bg-required data-[required=true]:bg-required",
          // Disabled
          "disabled:bg-disabled disabled:text-text-body disabled:cursor-not-allowed",
          // File input
          "file:text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium",
          // 전환 효과
          "transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
