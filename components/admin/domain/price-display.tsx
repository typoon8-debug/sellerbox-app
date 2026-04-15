import { cn } from "@/lib/utils";

const krwFormatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
});

interface PriceDisplayProps {
  amount: number;
  className?: string;
}

export function PriceDisplay({ amount, className }: PriceDisplayProps) {
  return <span className={cn("tabular-nums", className)}>{krwFormatter.format(amount)}</span>;
}
