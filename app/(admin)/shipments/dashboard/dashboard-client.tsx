"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { useRealtimeChannel } from "@/lib/hooks/use-realtime-channel";
import { Package, Truck, CheckCircle, Activity } from "lucide-react";
import type { DashboardStats } from "@/app/(admin)/shipments/dashboard/page";
import type { ShipmentEventRow } from "@/lib/types/domain/shipment";

interface StatCard {
  key: keyof DashboardStats;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

const STAT_CARDS: StatCard[] = [
  {
    key: "totalOrders",
    label: "총 주문",
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "delivered",
    label: "배송 완료",
    icon: CheckCircle,
    color: "text-primary",
    bg: "bg-primary-light",
  },
  {
    key: "inFulfillment",
    label: "피킹/패킹",
    icon: Activity,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  {
    key: "inDelivery",
    label: "배송중",
    icon: Truck,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

interface DashboardClientProps {
  initialStats: DashboardStats;
  initialEvents: ShipmentEventRow[];
}

export function DashboardClient({ initialStats, initialEvents }: DashboardClientProps) {
  const router = useRouter();
  const [events, setEvents] = useState<ShipmentEventRow[]>(initialEvents);

  // Realtime: shipment_event 테이블 INSERT 구독
  useRealtimeChannel("shipment_event", (payload) => {
    // 새 이벤트를 목록 앞에 추가
    setEvents((prev) => [payload.new, ...prev].slice(0, 50));
    // 통계 카드 최신화를 위해 서버 데이터 갱신
    router.refresh();
  });

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-6 p-6">
      {/* 현황 카드 4종 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.key}
              className="border-separator bg-panel flex flex-col gap-2 rounded-lg border p-4"
            >
              <div
                className={`${stat.bg} ${stat.color} flex h-10 w-10 items-center justify-center rounded-lg`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-text-placeholder text-sm">{stat.label}</p>
              <p className="text-2xl font-bold">{initialStats[stat.key]}</p>
            </div>
          );
        })}
      </div>

      {/* 배송 이벤트 타임라인 */}
      <div>
        <h3 className="mb-4 text-sm font-semibold">배송 이벤트 타임라인</h3>
        {sortedEvents.length === 0 ? (
          <p className="text-text-placeholder text-sm">배송 이벤트가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {sortedEvents.map((evt) => (
              <div key={evt.event_id} className="flex items-start gap-4">
                <div className="text-text-placeholder w-32 pt-0.5 text-xs whitespace-nowrap">
                  {evt.created_at.slice(0, 16).replace("T", " ")}
                </div>
                <div className="border-separator bg-panel flex-1 rounded border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <DomainBadge type="shipment" status="OUT_FOR_DELIVERY" />
                    <span className="text-sm font-medium">{evt.event_code}</span>
                  </div>
                  <p className="text-text-placeholder mt-1 text-xs">{evt.memo ?? "-"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
