"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_QUICK_SLOTS } from "@/lib/mocks/shipment";

type QuickSlot = (typeof MOCK_QUICK_SLOTS)[number];

export function QuickClosingClient() {
  const [slots, setSlots] = useState<QuickSlot[]>(MOCK_QUICK_SLOTS);

  const toggleSlot = (slotId: string) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.slot_id !== slotId) return slot;
        const next = { ...slot, is_closed: !slot.is_closed };
        toast.success(
          `${slot.timeslot} 슬롯이 ${next.is_closed ? "마감" : "오픈"} 처리되었습니다.`
        );
        return next;
      })
    );
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {slots.map((slot) => (
          <div
            key={slot.slot_id}
            className={`flex flex-col gap-3 rounded-lg border p-4 ${
              slot.is_closed ? "border-alert-red/30 bg-alert-red-bg" : "border-separator bg-panel"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{slot.timeslot}</span>
              <Badge
                variant="outline"
                className={
                  slot.is_closed
                    ? "bg-alert-red-bg text-alert-red border-alert-red/30"
                    : "bg-primary-light text-primary border-primary/30"
                }
              >
                {slot.is_closed ? "마감" : "운영중"}
              </Badge>
            </div>
            <div className="text-text-placeholder text-sm">
              예약: {slot.reserved_count} / 총 {slot.capacity}
            </div>
            <div className="bg-disabled h-2 w-full rounded-full">
              <div
                className={`h-2 rounded-full ${
                  slot.reserved_count >= slot.capacity ? "bg-alert-red" : "bg-primary"
                }`}
                style={{ width: `${Math.min(100, (slot.reserved_count / slot.capacity) * 100)}%` }}
              />
            </div>
            <Button
              size="sm"
              variant={slot.is_closed ? "outline-gray" : "destructive"}
              onClick={() => toggleSlot(slot.slot_id)}
              className="w-full"
            >
              {slot.is_closed ? "슬롯 오픈" : "슬롯 마감"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
