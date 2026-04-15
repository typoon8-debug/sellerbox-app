"use client";

import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { MOCK_DASHBOARD_STATS, MOCK_SHIPMENT_EVENTS, MOCK_SHIPMENTS } from "@/lib/mocks/shipment";
import { Package, Truck, CheckCircle, Activity } from "lucide-react";

const STATS = [
  {
    key: "totalOrders",
    label: "총 주문",
    value: MOCK_DASHBOARD_STATS.totalOrders,
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "delivered",
    label: "배송 완료",
    value: MOCK_DASHBOARD_STATS.delivered,
    icon: CheckCircle,
    color: "text-primary",
    bg: "bg-primary-light",
  },
  {
    key: "inFulfillment",
    label: "피킹/패킹",
    value: MOCK_DASHBOARD_STATS.inFulfillment,
    icon: Activity,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  {
    key: "inDelivery",
    label: "배송중",
    value: MOCK_DASHBOARD_STATS.inDelivery,
    icon: Truck,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

export function DashboardClient() {
  const sortedEvents = [...MOCK_SHIPMENT_EVENTS].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-6 p-6">
      {/* 현황 카드 4종 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {STATS.map((stat) => {
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
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* 배송 이벤트 타임라인 */}
      <div>
        <h3 className="mb-4 text-sm font-semibold">배송 이벤트 타임라인</h3>
        <div className="space-y-3">
          {sortedEvents.map((evt) => {
            const shipment = MOCK_SHIPMENTS.find((s) => s.shipment_id === evt.shipment_id);
            return (
              <div key={evt.event_id} className="flex items-start gap-4">
                <div className="text-text-placeholder w-32 pt-0.5 text-xs whitespace-nowrap">
                  {evt.created_at.slice(0, 16).replace("T", " ")}
                </div>
                <div className="border-separator bg-panel flex-1 rounded border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <DomainBadge type="shipment" status={shipment?.status ?? ""} />
                    <span className="text-sm font-medium">{evt.event_code}</span>
                  </div>
                  <p className="text-text-placeholder mt-1 text-xs">{evt.memo}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
