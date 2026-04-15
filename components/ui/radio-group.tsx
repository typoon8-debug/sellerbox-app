"use client";

import * as React from "react";
import { CircleIcon } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/* 가이드 §4 라디오버튼 규격
 * Circle icon Size: 18×18px (여백 포함), Outline 1px
 * Selected: bg #2E85FF, white dot
 * Unselected: outline #A2ACBD, bg #FFFFFF
 * Hover: outline #2E85FF (미선택 상태)
 * Disabled 미선택: bg #F0F0F0 / Disabled 선택: bg #6C6C6C
 * 아이콘↔라벨: 3px, 옵션 간격: 12px */

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        // 크기: 18×18
        "border-neutral-line aspect-square size-[18px] shrink-0 rounded-full border",
        // Normal 미선택
        "bg-control text-primary",
        // Hover 미선택: outline #2E85FF
        "hover:border-primary",
        // 선택 상태: bg #2E85FF
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
        // Focus
        "focus-visible:ring-primary/30 focus-visible:ring-[2px] focus-visible:outline-none",
        // Disabled
        "disabled:data-[state=unchecked]:bg-hover disabled:data-[state=checked]:bg-text-placeholder disabled:cursor-not-allowed",
        // 유효성
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-white text-white" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
