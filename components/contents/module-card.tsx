import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ModuleVariant = "query" | "input" | "table" | "composite";

interface ModuleCardProps {
  title?: string;
  subtitle?: string;
  variant?: ModuleVariant;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<ModuleVariant, string> = {
  query: "bg-panel border-separator",
  input: "bg-control border-separator",
  table: "bg-control border-separator",
  composite: "bg-control border-separator",
};

export function ModuleCard({
  title,
  subtitle,
  variant = "input",
  actions,
  children,
  className,
}: ModuleCardProps) {
  return (
    <div className={cn("rounded border", variantStyles[variant], className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
            {title && <span className="text-text-body text-sm font-semibold">{title}</span>}
            {subtitle && <span className="text-text-placeholder text-xs">{subtitle}</span>}
          </div>
          {actions && <div className="flex items-center gap-1">{actions}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
