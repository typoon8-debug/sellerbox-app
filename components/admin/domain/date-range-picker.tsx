"use client";

import { KoreanDatePicker } from "@/components/admin/korean-date-picker";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  from: Date | undefined;
  to: Date | undefined;
  onFromChange: (date: Date | undefined) => void;
  onToChange: (date: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
}

export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  disabled,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <KoreanDatePicker
        value={from}
        onChange={onFromChange}
        placeholder="시작일"
        disabled={disabled}
        className="w-36"
      />
      <span className="text-text-placeholder text-sm">~</span>
      <KoreanDatePicker
        value={to}
        onChange={onToChange}
        placeholder="종료일"
        disabled={disabled}
        className="w-36"
      />
    </div>
  );
}
