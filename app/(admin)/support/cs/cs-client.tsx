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
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { CsAlertBanner } from "@/app/(admin)/support/cs/_components/cs-alert-banner";
import { CsTicketTable } from "@/app/(admin)/support/cs/_components/cs-ticket-table";
import { CsDetailPanel } from "@/app/(admin)/support/cs/_components/cs-detail-panel";
import { CsActionPanel } from "@/app/(admin)/support/cs/_components/cs-action-panel";
import { CsPrintDialog } from "@/app/(admin)/support/cs/_components/cs-print-dialog";
import type { ActionFormValues } from "@/app/(admin)/support/cs/_components/cs-action-panel";
import { fetchCsTicketsByStore, updateCsTicket } from "@/lib/actions/domain/support.actions";
import type { CsTicketWithJoins } from "@/lib/types/domain/support";

interface CsClientProps {
  stores: { store_id: string; name: string }[];
  initialTickets: CsTicketWithJoins[];
  initialOpenCount: number;
  initialFrom: string;
  initialTo: string;
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toDateStr(date: Date | undefined, fallback: string): string {
  if (!date) return fallback;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function CsClient({
  stores,
  initialTickets,
  initialOpenCount,
  initialFrom,
  initialTo,
}: CsClientProps) {
  const [isPending, startTransition] = useTransition();

  // ─── 검색 조건 ───────────────────────────────────────────────────────────────
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0]?.store_id ?? "");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(parseLocalDate(initialFrom));
  const [dateTo, setDateTo] = useState<Date | undefined>(parseLocalDate(initialTo));
  const [statusFilter, setStatusFilter] = useState<"OPEN" | "IN_PROGRESS" | "CLOSED" | "ALL">(
    "OPEN"
  );

  // ─── 데이터 ──────────────────────────────────────────────────────────────────
  const [tickets, setTickets] = useState<CsTicketWithJoins[]>(initialTickets);
  const [openCount, setOpenCount] = useState(initialOpenCount);
  const [activeTicket, setActiveTicket] = useState<CsTicketWithJoins | null>(null);

  // ─── 다이얼로그 ──────────────────────────────────────────────────────────────
  const [printOpen, setPrintOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  // ─── 조회 ─────────────────────────────────────────────────────────────────────
  const doSearch = () => {
    if (!selectedStoreId) {
      toast.warning("가게를 선택해 주세요.");
      return;
    }
    const from = toDateStr(dateFrom, initialFrom);
    const to = toDateStr(dateTo, initialTo);

    startTransition(async () => {
      const result = await fetchCsTicketsByStore({
        store_id: selectedStoreId,
        from_date: from,
        to_date: to,
        status: statusFilter,
      });
      if (!result.ok) {
        toast.error(result.error?.message ?? "CS 목록 조회에 실패했습니다.");
        return;
      }
      const { tickets: newTickets, openCount: newOpenCount } = result.data as {
        tickets: CsTicketWithJoins[];
        openCount: number;
      };
      setTickets(newTickets);
      setOpenCount(newOpenCount);
      setActiveTicket(null);
    });
  };

  const doReset = () => {
    const today = new Date();
    setSelectedStoreId(stores[0]?.store_id ?? "");
    setDateFrom(today);
    setDateTo(today);
    setStatusFilter("OPEN");
    setTickets(initialTickets);
    setOpenCount(initialOpenCount);
    setActiveTicket(null);
  };

  // ─── 저장 ─────────────────────────────────────────────────────────────────────
  const handleSave = (values: ActionFormValues) => {
    if (!activeTicket) return;
    startTransition(async () => {
      const result = await updateCsTicket({
        ticket_id: activeTicket.ticket_id,
        cs_action: values.cs_action,
        status: values.status,
      });
      if (!result.ok) {
        toast.error(result.error?.message ?? "저장에 실패했습니다.");
        return;
      }
      toast.success("CS 처리결과가 저장되었습니다.");

      const updated: CsTicketWithJoins = {
        ...activeTicket,
        cs_action: values.cs_action,
        status: values.status,
      };
      setTickets((prev) => prev.map((t) => (t.ticket_id === activeTicket.ticket_id ? updated : t)));
      setActiveTicket(updated);

      // 저장 후 자동으로 Follow-up 인쇄 다이얼로그 오픈
      setPrintOpen(true);
    });
  };

  // ─── 닫기 ─────────────────────────────────────────────────────────────────────
  const handleClose = () => {
    setCloseConfirmOpen(true);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
      {/* 검색 조건 */}
      <div className="bg-card flex flex-wrap items-end gap-3 rounded-lg border p-4">
        <QueryField label="가게">
          {stores.length === 0 ? (
            <span className="text-sm text-gray-400">소속 가게 없음</span>
          ) : (
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
          )}
        </QueryField>

        <QueryField label="기간">
          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            onFromChange={setDateFrom}
            onToChange={setDateTo}
            disabled={isPending}
          />
        </QueryField>

        <QueryField label="상태">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as "OPEN" | "IN_PROGRESS" | "CLOSED" | "ALL")}
            disabled={isPending}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">OPEN</SelectItem>
              <SelectItem value="IN_PROGRESS">처리중</SelectItem>
              <SelectItem value="CLOSED">완료</SelectItem>
              <SelectItem value="ALL">전체</SelectItem>
            </SelectContent>
          </Select>
        </QueryField>

        <QueryActions onSearch={doSearch} onReset={doReset} loading={isPending} />
      </div>

      {/* OPEN 알림 배너 */}
      <CsAlertBanner openCount={openCount} />

      {/* Panel 1: CS 목록 */}
      <div className="bg-card rounded-lg border p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            고객요청정보
            <span className="ml-1 text-gray-400">({tickets.length}건)</span>
          </span>
        </div>
        <CsTicketTable
          tickets={tickets}
          activeTicketId={activeTicket?.ticket_id ?? null}
          onRowClick={setActiveTicket}
          loading={isPending}
        />
      </div>

      {/* Panel 2: 상세 + 처리 */}
      <div className="bg-card grid flex-1 grid-cols-2 gap-4 rounded-lg border p-4">
        <CsDetailPanel ticket={activeTicket} />
        <CsActionPanel
          ticket={activeTicket}
          onClose={handleClose}
          onSave={handleSave}
          onPrint={() => setPrintOpen(true)}
          loading={isPending}
        />
      </div>

      {/* CS Follow-up 인쇄 다이얼로그 */}
      <CsPrintDialog open={printOpen} onOpenChange={setPrintOpen} ticket={activeTicket} />

      {/* 닫기 시 변경사항 확인 */}
      <ConfirmDialog
        open={closeConfirmOpen}
        onOpenChange={setCloseConfirmOpen}
        title="변경사항이 있습니다"
        description="저장하지 않은 변경사항이 있습니다. 정말 닫으시겠습니까?"
        confirmLabel="닫기"
        cancelLabel="취소"
        destructive={false}
        onConfirm={() => {
          setActiveTicket(null);
        }}
      />
    </div>
  );
}
