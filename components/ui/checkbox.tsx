"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/* 가이드 §4 체크박스 규격
 * 18×18px (여백 포함), outline 1px, radius 없음(square)
 * Checked: bg #2E85FF, icon #FFFFFF
 * Unchecked: outline #A2ACBD, bg #FFFFFF
 * Hover: outline #2E85FF (미선택 상태만)
 * Disabled 미선택: bg #F0F0F0 / Disabled 선택: bg #6C6C6C */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // 크기 18×18 (size-[18px])
      "h-[18px] w-[18px] shrink-0",
      // radius square (rounded-sm → rounded-none)
      "border-neutral-line rounded-none border",
      // Normal 미선택
      "bg-control",
      // Hover 미선택: outline #2E85FF
      "hover:border-primary",
      // 선택 상태: bg #2E85FF
      "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
      // Focus
      "focus-visible:ring-primary/30 focus-visible:ring-[2px] focus-visible:outline-none",
      // Disabled
      "disabled:data-[state=unchecked]:bg-hover disabled:data-[state=checked]:bg-text-placeholder disabled:cursor-not-allowed",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      <Check className="h-3 w-3 stroke-[3]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
