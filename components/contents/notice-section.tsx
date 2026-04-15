import { type ReactNode } from "react";
import { Info, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type NoticeVariant = "info" | "warning" | "danger";

interface NoticeSectionProps {
  children: ReactNode;
  variant?: NoticeVariant;
  className?: string;
}

const variantMap: Record<
  NoticeVariant,
  { wrapperCn: string; iconCn: string; textCn: string; Icon: typeof Info }
> = {
  info: {
    wrapperCn: "border-primary/30 bg-toast",
    iconCn: "text-primary",
    textCn: "text-text-body",
    Icon: Info,
  },
  warning: {
    wrapperCn: "border-yellow-300 bg-required",
    iconCn: "text-yellow-600",
    textCn: "text-text-body",
    Icon: AlertTriangle,
  },
  danger: {
    wrapperCn: "border-alert-red/40 bg-alert-red-bg",
    iconCn: "text-alert-red",
    textCn: "text-text-body",
    Icon: AlertCircle,
  },
};

export function NoticeSection({ children, variant = "info", className }: NoticeSectionProps) {
  const { wrapperCn, iconCn, textCn, Icon } = variantMap[variant];

  return (
    <div className={cn("flex gap-2 rounded border p-3", wrapperCn, className)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconCn)} />
      <div className={cn("text-sm", textCn)}>{children}</div>
    </div>
  );
}
