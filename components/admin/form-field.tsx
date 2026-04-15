import { type ReactNode } from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface AdminFormFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  horizontal?: boolean; // 라벨-인풋 가로 배치
}

export function AdminFormField({
  label,
  required,
  children,
  className,
  horizontal = false,
}: AdminFormFieldProps) {
  return (
    <FormItem className={cn(horizontal ? "flex items-center gap-3" : "space-y-1.5", className)}>
      <FormLabel
        className={cn(
          "text-sm",
          required && "after:text-alert-red after:ml-0.5 after:content-['*']",
          horizontal && "w-24 shrink-0 text-right"
        )}
      >
        {label}
      </FormLabel>
      <div className={cn("flex-1", horizontal && "min-w-0")}>
        <FormControl>{children}</FormControl>
        <FormMessage className="mt-1 text-xs" />
      </div>
    </FormItem>
  );
}
