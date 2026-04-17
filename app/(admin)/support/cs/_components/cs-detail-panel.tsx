"use client";

import type { CsTicketWithJoins } from "@/lib/types/domain/support";

interface CsDetailPanelProps {
  ticket: CsTicketWithJoins | null;
}

const TYPE_LABELS: Record<string, string> = {
  REFUND: "환불",
  EXCHANGE: "교환",
  INQUIRY: "문의",
};

export function CsDetailPanel({ ticket }: CsDetailPanelProps) {
  if (!ticket) {
    return (
      <div className="flex h-full min-h-32 items-center justify-center rounded-md border border-dashed text-sm text-gray-400">
        CS 티켓을 선택해 주세요.
      </div>
    );
  }

  // 대표 상품명 (첫 번째 order_item)
  const firstItem = ticket.order?.order_item?.[0];
  const productName = firstItem?.item?.name ?? "-";

  return (
    <div className="rounded-md border p-4">
      <p className="mb-3 text-sm font-semibold text-gray-700">고객 CS 내용</p>
      <div className="space-y-2 text-sm">
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-gray-500">회원</span>
          <span>{ticket.customer?.email ?? ticket.customer_id.slice(0, 12)}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-gray-500">상품명</span>
          <span>{productName}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-gray-500">유형</span>
          <span>{TYPE_LABELS[ticket.type] ?? ticket.type}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-gray-500">내용</span>
          <span className="leading-relaxed whitespace-pre-wrap">{ticket.cs_contents}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-gray-500">회원ID</span>
          <span className="font-mono text-xs text-gray-400">
            {ticket.customer_id.slice(0, 16)}…
          </span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-gray-500">주문ID</span>
          <span className="font-mono text-xs text-gray-400">{ticket.order_id.slice(0, 16)}…</span>
        </div>
      </div>
    </div>
  );
}
