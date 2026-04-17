"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QueryField } from "@/components/admin/query-field";
import { QueryActions } from "@/components/admin/query-actions";
import { DateRangePicker } from "@/components/admin/domain/date-range-picker";
import { ShipmentListPanel } from "@/app/(admin)/shipments/requests/_components/shipment-list-panel";
import { BbqGroupPanel } from "@/app/(admin)/shipments/requests/_components/bbq-group-panel";
import {
  fetchShipmentsByStore,
  fetchBbqShipmentGroups,
  batchStartDelivery,
  batchCompleteDelivery,
} from "@/lib/actions/domain/shipment.actions";
import type { ShipmentWithOrder, BbqAddressGroup } from "@/lib/repositories/shipment.repository";

interface DeliveryClientProps {
  stores: { store_id: string; name: string }[];
  initialShipments: ShipmentWithOrder[];
  initialBbqGroups: BbqAddressGroup[];
  initialFrom: string;
  initialTo: string;
}

/** Date 객체를 "YYYY-MM-DD"로 변환 */
function toDateStr(date: Date | undefined, fallback: string): string {
  if (!date) return fallback;
  return date.toISOString().split("T")[0];
}

/** 배송관리 통합 화면 Client Component */
export function DeliveryClient({
  stores,
  initialShipments,
  initialBbqGroups,
  initialFrom,
  initialTo,
}: DeliveryClientProps) {
  const [isPending, startTransition] = useTransition();

  // ─── 검색 조건 ───────────────────────────────────────────────────────────────
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0]?.store_id ?? "");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(initialFrom));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date(initialTo));

  // ─── Panel 1: 배송 목록 ──────────────────────────────────────────────────────
  const [shipments, setShipments] = useState<ShipmentWithOrder[]>(initialShipments);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ─── Panel 2: BBQ 그룹 ───────────────────────────────────────────────────────
  const [bbqGroups, setBbqGroups] = useState<BbqAddressGroup[]>(initialBbqGroups);

  // ─── 조회 ────────────────────────────────────────────────────────────────────
  const doSearch = () => {
    if (!selectedStoreId) {
      toast.warning("가게를 선택해 주세요.");
      return;
    }
    const from = toDateStr(dateFrom, initialFrom);
    const to = toDateStr(dateTo, initialTo);

    startTransition(async () => {
      const [shipmentsResult, bbqResult] = await Promise.all([
        fetchShipmentsByStore({ store_id: selectedStoreId, from_date: from, to_date: to }),
        fetchBbqShipmentGroups({ store_id: selectedStoreId, from_date: from, to_date: to }),
      ]);

      if (!shipmentsResult.ok) {
        toast.error(shipmentsResult.error?.message ?? "배송 목록 조회에 실패했습니다.");
      } else {
        setShipments(shipmentsResult.data ?? []);
        setSelectedIds(new Set());
      }

      if (!bbqResult.ok) {
        toast.error(bbqResult.error?.message ?? "BBQ 배송 조회에 실패했습니다.");
      } else {
        setBbqGroups(bbqResult.data ?? []);
      }
    });
  };

  const doReset = () => {
    const today = new Date();
    setSelectedStoreId(stores[0]?.store_id ?? "");
    setDateFrom(today);
    setDateTo(today);
    setShipments(initialShipments);
    setBbqGroups(initialBbqGroups);
    setSelectedIds(new Set());
  };

  // ─── 배송 출발 ───────────────────────────────────────────────────────────────
  const handleStartDelivery = () => {
    const ids = Array.from(selectedIds);
    startTransition(async () => {
      const result = await batchStartDelivery({ shipment_ids: ids });
      if (!result.ok) {
        toast.error(result.error?.message ?? "배송 출발 처리에 실패했습니다.");
        return;
      }
      toast.success(`${ids.length}건 배송 출발 처리 완료`);
      doSearch();
    });
  };

  // ─── 배송 완료 ───────────────────────────────────────────────────────────────
  const handleCompleteDelivery = () => {
    const ids = Array.from(selectedIds);
    startTransition(async () => {
      const result = await batchCompleteDelivery({ shipment_ids: ids });
      if (!result.ok) {
        toast.error(result.error?.message ?? "배송 완료 처리에 실패했습니다.");
        return;
      }
      toast.success(`${ids.length}건 배송 완료 처리`);
      doSearch();
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
      {/* 검색 조건 */}
      <div className="bg-card flex flex-wrap items-end gap-3 rounded-lg border p-4">
        <QueryField label="가게">
          <Select value={selectedStoreId} onValueChange={setSelectedStoreId} disabled={isPending}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="가게 선택" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((s) => (
                <SelectItem key={s.store_id} value={s.store_id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </QueryField>

        <QueryField label="주문일자">
          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            onFromChange={setDateFrom}
            onToChange={setDateTo}
            disabled={isPending}
          />
        </QueryField>

        <QueryActions onSearch={doSearch} onReset={doReset} loading={isPending} />
      </div>

      {/* Panel 1: 전체 배송 목록 */}
      <div className="bg-card rounded-lg border p-4">
        <ShipmentListPanel
          shipments={shipments}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onStartDelivery={handleStartDelivery}
          onCompleteDelivery={handleCompleteDelivery}
          loading={isPending}
        />
      </div>

      {/* Panel 2: BBQ 배송지별 묶음 */}
      <div className="bg-card flex-1 overflow-auto rounded-lg border p-4">
        <BbqGroupPanel groups={bbqGroups} loading={isPending} />
      </div>
    </div>
  );
}
