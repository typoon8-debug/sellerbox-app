"use client";

import * as React from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface KoreanDatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * 가이드 §9 데이트피커
 * - Input-like 트리거 (h-8, border-neutral-line, hover:border-primary)
 * - 달력 가이드 규격 적용 (calendar.tsx)
 */
export function KoreanDatePicker({
  value,
  onChange,
  placeholder = "날짜 선택",
  disabled,
  required,
  className,
}: KoreanDatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline-gray"
          className={cn(
            "h-8 w-full justify-start px-3 font-normal",
            "border-neutral-line hover:border-primary",
            !value && "text-text-placeholder",
            required && !value && "bg-required",
            disabled && "bg-disabled text-text-placeholder cursor-not-allowed opacity-100",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {value ? format(value, "yyyy-MM-dd", { locale: ko }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus />
      </PopoverContent>
    </Popover>
  );
}
