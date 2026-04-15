"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { closeSlot } from "@/lib/actions/domain/shipment.actions";
import { toastResult } from "@/lib/utils/toast-result";
import type { StoreQuickSlotUsageRow } from "@/lib/types/domain/shipment";

// 마감 여부 판단 기준: reserved_count가 9999 이상이면 마감
const CLOSE_THRESHOLD = 9999;

interface QuickClosingClientProps {
  initialSlots: StoreQuickSlotUsageRow[];
}

export function QuickClosingClient({ initialSlots }: QuickClosingClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 슬롯 마감 처리
  const handleCloseSlot = async (slot: StoreQuickSlotUsageRow) => {
    const result = await closeSlot({
      store_id: slot.store_id,
      depart_date: slot.depart_date,
      depart_time: slot.depart_time,
    });
    const ok = toastResult(result, {
      successMessage: `${slot.depart_time} 슬롯이 마감 처리되었습니다.`,
    });
    if (ok) {
      startTransition(() => router.refresh());
    }
  };

  if (initialSlots.length === 0) {
    return (
      <div className="p-6">
        <p className="text-text-placeholder text-sm">등록된 바로퀵 슬롯이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {initialSlots.map((slot) => {
          const isClosed = slot.reserved_count >= CLOSE_THRESHOLD;
          return (
            <div
              key={slot.usage_id}
              className={`flex flex-col gap-3 rounded-lg border p-4 ${
                isClosed ? "border-alert-red/30 bg-alert-red-bg" : "border-separator bg-panel"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{slot.depart_time}</span>
                <Badge
                  variant="outline"
                  className={
                    isClosed
                      ? "bg-alert-red-bg text-alert-red border-alert-red/30"
                      : "bg-primary-light text-primary border-primary/30"
                  }
                >
                  {isClosed ? "마감" : "운영중"}
                </Badge>
              </div>
              <div className="text-text-placeholder text-sm">
                날짜: {slot.depart_date} / 예약: {isClosed ? "마감" : slot.reserved_count}
              </div>
              <Button
                size="sm"
                variant={isClosed ? "outline-gray" : "destructive"}
                onClick={() => handleCloseSlot(slot)}
                disabled={isPending || isClosed}
                className="w-full"
              >
                {isClosed ? "마감됨" : "슬롯 마감"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
