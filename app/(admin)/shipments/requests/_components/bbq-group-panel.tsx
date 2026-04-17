"use client";

import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { MapPin } from "lucide-react";
import type { BbqAddressGroup } from "@/lib/repositories/shipment.repository";

interface BbqGroupPanelProps {
  groups: BbqAddressGroup[];
  loading?: boolean;
}

export function BbqGroupPanel({ groups, loading = false }: BbqGroupPanelProps) {
  if (loading) {
    return (
      <div className="text-text-placeholder flex h-32 items-center justify-center text-sm">
        BBQ 배송 데이터를 불러오는 중...
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-text-placeholder flex h-32 items-center justify-center text-sm">
        BBQ 배송건이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-text-main text-sm font-medium">
        BBQ 배송지별 묶음
        <span className="text-text-placeholder ml-1">({groups.length}개 주소지)</span>
      </span>
      <div className="flex flex-col gap-3">
        {groups.map((group) => (
          <div key={group.address_id} className="bg-card rounded-lg border">
            {/* 카드 헤더 */}
            <div className="bg-muted/30 flex items-center gap-2 border-b px-4 py-2">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span className="flex-1 font-mono text-sm font-medium">
                {group.address_id === "UNKNOWN" ? "주소 미지정" : group.address_id}
              </span>
              <span className="text-text-placeholder text-xs">{group.orders.length}건</span>
              <DomainBadge type="deliveryMethod" status="BBQ" />
            </div>

            {/* 카드 본문: 주문별 행 */}
            <div className="divide-y">
              {group.orders.map((order) => (
                <div key={order.shipment_id} className="grid grid-cols-12 gap-2 px-4 py-3 text-xs">
                  {/* 배송ID */}
                  <div className="text-text-placeholder col-span-2">
                    <div className="text-text-main font-medium">배송ID</div>
                    <div className="font-mono">{order.shipment_id.slice(0, 8)}…</div>
                  </div>

                  {/* 주문일시 */}
                  <div className="col-span-3">
                    <div className="text-text-main font-medium">주문일시</div>
                    <div>
                      {order.ordered_at ? order.ordered_at.slice(0, 16).replace("T", " ") : "-"}
                    </div>
                  </div>

                  {/* 배송예정 */}
                  <div className="col-span-2">
                    <div className="text-text-main font-medium">배송예정</div>
                    <div>
                      {order.quick_depart_date
                        ? `${order.quick_depart_date} ${order.quick_depart_time?.slice(0, 5) ?? ""}`
                        : "-"}
                    </div>
                  </div>

                  {/* 상품목록 */}
                  <div className="col-span-5">
                    <div className="text-text-main font-medium">상품</div>
                    <div className="flex flex-wrap gap-1">
                      {order.items.length === 0 ? (
                        <span className="text-text-placeholder">-</span>
                      ) : (
                        order.items.map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-muted text-text-main rounded px-1.5 py-0.5 text-[11px]"
                          >
                            {item.name} ×{item.qty}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
