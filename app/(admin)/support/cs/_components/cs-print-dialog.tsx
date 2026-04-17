"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import type { CsTicketWithJoins } from "@/lib/types/domain/support";

interface CsPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: CsTicketWithJoins | null;
}

const TYPE_LABELS: Record<string, string> = {
  REFUND: "환불",
  EXCHANGE: "교환",
  INQUIRY: "문의",
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "접수",
  IN_PROGRESS: "처리중",
  CLOSED: "완료",
};

export function CsPrintDialog({ open, onOpenChange, ticket }: CsPrintDialogProps) {
  const handlePrint = () => {
    window.print();
  };

  if (!ticket) return null;

  const firstItem = ticket.order?.order_item?.[0];
  const productName = firstItem?.item?.name ?? "-";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>CS Follow-Up 출력</DialogTitle>
        </DialogHeader>

        <div id="cs-print-area" className="space-y-4 text-sm print:block">
          <div className="border-b pb-3">
            <p className="text-lg font-bold">고객 CS 처리 결과</p>
            <p className="text-xs text-gray-400">발행일시: {new Date().toLocaleString("ko-KR")}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-gray-500">CS티켓ID</span>
              <p className="font-mono text-xs">{ticket.ticket_id.slice(0, 16)}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">유형</span>
              <p>{TYPE_LABELS[ticket.type] ?? ticket.type}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">회원</span>
              <p>{ticket.customer?.email ?? ticket.customer_id.slice(0, 12)}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">상품명</span>
              <p>{productName}</p>
            </div>
          </div>

          <div className="rounded-md bg-gray-50 p-3">
            <p className="mb-1 text-xs font-semibold text-gray-600">고객 요청 내용</p>
            <p className="text-sm whitespace-pre-wrap">{ticket.cs_contents}</p>
          </div>

          <div className="rounded-md bg-blue-50 p-3">
            <p className="mb-1 text-xs font-semibold text-blue-700">CS 처리 결과</p>
            <p className="text-sm whitespace-pre-wrap">{ticket.cs_action || "(처리결과 없음)"}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">처리 상태:</span>
            <span className="font-semibold">{STATUS_LABELS[ticket.status] ?? ticket.status}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
          <Button size="sm" onClick={handlePrint} className="gap-1">
            <Printer className="h-4 w-4" />
            인쇄
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
