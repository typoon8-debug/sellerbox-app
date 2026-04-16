import { Package, Truck, ShoppingBag, ClipboardList } from "lucide-react";
import type { DashboardStats } from "@/lib/repositories/order.repository";

interface DashboardCardsProps {
  stats: DashboardStats;
}

/** 주문처리 화면 상단 대시보드 통계 카드 4종 */
export function DashboardCards({ stats }: DashboardCardsProps) {
  const cards = [
    {
      label: "금일 누적 주문수",
      value: stats.todayOrderCount,
      icon: ClipboardList,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      iconColor: "text-blue-400",
    },
    {
      label: "피킹해 주세요",
      value: stats.pickingPendingCount,
      icon: ShoppingBag,
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      iconColor: "text-orange-400",
    },
    {
      label: "패킹해 주세요",
      value: stats.packingPendingCount,
      icon: Package,
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      iconColor: "text-yellow-400",
    },
    {
      label: "배송요청한 건수",
      value: stats.dispatchedCount,
      icon: Truck,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      iconColor: "text-green-400",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 px-4 py-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${card.bgColor}`}
          >
            <Icon className={`h-8 w-8 flex-shrink-0 ${card.iconColor}`} />
            <div>
              <p className="text-muted-foreground text-xs font-medium">{card.label}</p>
              <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
