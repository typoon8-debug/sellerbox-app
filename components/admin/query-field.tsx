import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface QueryFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/** 조회모듈 내 라벨+컨트롤 단위 필드 */
export function QueryField({ label, required, children, className }: QueryFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className="text-text-placeholder text-xs">
        {label}
        {required && <span className="text-alert-red ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
