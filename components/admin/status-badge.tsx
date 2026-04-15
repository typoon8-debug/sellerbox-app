import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "DELETED";

const statusConfig: Record<StatusVariant, { label: string; className: string }> = {
  ACTIVE: {
    label: "활성",
    className: "bg-primary-light text-primary border-primary/30",
  },
  INACTIVE: {
    label: "비활성",
    className: "bg-disabled text-text-placeholder border-separator",
  },
  SUSPENDED: {
    label: "정지",
    className: "bg-required text-text-body border-yellow-300",
  },
  DELETED: {
    label: "삭제",
    className: "bg-alert-red-bg text-alert-red border-alert-red/30",
  },
};

interface StatusBadgeProps {
  status: StatusVariant;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}

// 활성/비활성 boolean 버전 (users 페이지용)
export function ActiveBadge({ active }: { active: boolean }) {
  return <StatusBadge status={active ? "ACTIVE" : "INACTIVE"} />;
}
