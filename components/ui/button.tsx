import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/* 가이드 §5 버튼 규격
 * 기본: h-8(32px), radius-4, px-2(8px), outline 1px
 * 조회 버튼 예외: px-3(12px) — data-cta="search" 로 구분
 * 팝업 버튼: h-10(40px), w-[100px], rounded-full
 * 아이콘 버튼: size-8(32px), 아이콘 size-4(16px) */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[2px] focus-visible:ring-ring/50 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[cta=search]:px-3",
  {
    variants: {
      variant: {
        // 회색 버튼(기본): line #A2ACBD, bg white, font #353535
        default:
          "border border-neutral-line bg-control text-text-body hover:bg-hover disabled:border-[#BEC5D1] disabled:text-[#BEC5D1]",
        // 블루 Solid 버튼: bg #2E85FF, text white
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover disabled:bg-primary-disabled",
        // 블루 Outline 버튼: line/font #2E85FF, bg white
        "outline-blue":
          "border border-primary text-primary bg-control hover:bg-hover disabled:border-primary-disabled disabled:text-primary-disabled",
        // 회색 Outline 버튼 (default alias)
        "outline-gray":
          "border border-neutral-line bg-control text-text-body hover:bg-hover disabled:border-[#BEC5D1] disabled:text-[#BEC5D1]",
        // 위험 액션(삭제 등): bg #EB5757
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 disabled:bg-destructive/50",
        // 고스트
        ghost: "hover:bg-hover hover:text-text-body",
        // 링크
        link: "text-primary underline-offset-4 hover:underline",
        // 하위 호환 (shadcn outline / secondary → outline-gray로 동일 처리)
        outline:
          "border border-neutral-line bg-control text-text-body hover:bg-hover disabled:border-[#BEC5D1] disabled:text-[#BEC5D1]",
        secondary:
          "border border-neutral-line bg-control text-text-body hover:bg-hover disabled:border-[#BEC5D1] disabled:text-[#BEC5D1]",
      },
      size: {
        // 기본 32px / 8px H-padding
        default: "h-8 px-2 has-[>svg]:px-1.5",
        sm: "h-7 px-2 text-xs",
        lg: "h-9 px-3",
        // 아이콘 전용 32×32
        icon: "size-8",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
        // 팝업 버튼: h-40 / w-100 / pill (가이드 §12)
        popup: "h-10 w-[100px] rounded-full px-4",
        // 이전 xs 호환
        xs: "h-6 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
