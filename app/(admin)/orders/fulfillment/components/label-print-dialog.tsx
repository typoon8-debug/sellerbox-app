"use client";

import { useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Printer } from "lucide-react";
import { fetchLabelPrintData } from "@/lib/actions/domain/order-fulfillment.actions";
import type { LabelPrintData } from "@/lib/actions/domain/order-fulfillment.actions";
import { PriceDisplay } from "@/components/admin/domain/price-display";

interface LabelPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrderIds: Set<string>;
}

const DELIVERY_METHOD_LABELS: Record<string, string> = {
  DELIVERY: "일반배송",
  BBQ: "바로퀵",
  PICKUP: "픽업",
  RESERVE: "예약",
  FRESH_MORNING: "새벽배송",
  SAME_DAY: "당일배송",
  "3P_DELIVERY": "3자 배송",
};

/** 주문건별 라벨 출력 다이얼로그 (주문내역 + 결제내역 + 배송주소) */
export function LabelPrintDialog({ open, onOpenChange, selectedOrderIds }: LabelPrintDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [labelData, setLabelData] = useState<LabelPrintData[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadData = useCallback(() => {
    if (selectedOrderIds.size === 0) {
      toast.warning("출력할 주문을 선택해 주세요.");
      return;
    }
    startTransition(async () => {
      const result = await fetchLabelPrintData({ order_ids: [...selectedOrderIds] });
      if (result.ok) {
        setLabelData(result.data as LabelPrintData[]);
        setLoaded(true);
      } else {
        toast.error(result.error.message);
      }
    });
  }, [selectedOrderIds]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen);
      if (nextOpen && !loaded) {
        loadData();
      }
      if (!nextOpen) {
        setLoaded(false);
        setLabelData([]);
      }
    },
    [onOpenChange, loaded, loadData]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-auto print:max-w-none print:overflow-visible">
        <DialogHeader className="print:hidden">
          <DialogTitle>라벨 출력</DialogTitle>
        </DialogHeader>

        {isPending && (
          <div className="flex h-40 items-center justify-center">
            <span className="text-muted-foreground text-sm">데이터를 불러오는 중...</span>
          </div>
        )}

        {!isPending && loaded && (
          <div className="space-y-4">
            <div className="flex justify-end print:hidden">
              <Button size="sm" onClick={() => window.print()} className="gap-1.5">
                <Printer className="h-4 w-4" />
                인쇄
              </Button>
            </div>

            {labelData.map((order, idx) => (
              <section
                key={order.order_id}
                className={`space-y-3 rounded border p-4 ${idx > 0 ? "print:break-before-page" : ""}`}
              >
                {/* 주문 헤더 */}
                <div className="border-b pb-2">
                  <p className="text-sm font-semibold">
                    주문번호: <span className="font-mono">{order.order_no}</span>
                  </p>
                  {order.ordered_at && (
                    <p className="text-muted-foreground text-xs">
                      주문일시: {order.ordered_at.slice(0, 16).replace("T", " ")}
                    </p>
                  )}
                </div>

                {/* 주문내역 */}
                <div>
                  <h3 className="text-muted-foreground mb-1 text-xs font-semibold">■ 주문내역</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>상품명</TableHead>
                        <TableHead className="w-16 text-center">수량</TableHead>
                        <TableHead className="w-24 text-right">단가</TableHead>
                        <TableHead className="w-24 text-right">금액</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs">{item.item_name}</TableCell>
                          <TableCell className="text-center text-xs">{item.qty}</TableCell>
                          <TableCell className="text-right text-xs">
                            <PriceDisplay amount={item.unit_price} />
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            <PriceDisplay amount={item.qty * item.unit_price} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* 결제내역 */}
                <div>
                  <h3 className="text-muted-foreground mb-1 text-xs font-semibold">■ 결제내역</h3>
                  <div className="space-y-0.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">상품합계</span>
                      <PriceDisplay amount={order.payment.subtotal} />
                    </div>
                    {order.payment.delivery_fee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-xs">배송비</span>
                        <PriceDisplay amount={order.payment.delivery_fee} />
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-1 font-semibold">
                      <span className="text-xs">최종결제</span>
                      <PriceDisplay amount={order.payment.final_payable} />
                    </div>
                  </div>
                </div>

                {/* 배송주소 */}
                <div>
                  <h3 className="text-muted-foreground mb-1 text-xs font-semibold">■ 배송주소</h3>
                  <div className="space-y-0.5 text-xs">
                    <p>
                      <span className="text-muted-foreground inline-block w-16">수취인</span>
                      {order.shipping.recipient_name}
                    </p>
                    {order.shipping.phone && (
                      <p>
                        <span className="text-muted-foreground inline-block w-16">연락처</span>
                        {order.shipping.phone}
                      </p>
                    )}
                    {order.shipping.address && (
                      <p>
                        <span className="text-muted-foreground inline-block w-16">주소</span>
                        {order.shipping.address}
                      </p>
                    )}
                    {order.shipping.delivery_method && (
                      <p>
                        <span className="text-muted-foreground inline-block w-16">배송방법</span>
                        {DELIVERY_METHOD_LABELS[order.shipping.delivery_method] ??
                          order.shipping.delivery_method}
                      </p>
                    )}
                    {order.shipping.requests && (
                      <p>
                        <span className="text-muted-foreground inline-block w-16">요청사항</span>
                        {order.shipping.requests}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
