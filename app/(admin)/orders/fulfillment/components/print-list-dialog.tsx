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
import { fetchPrintData } from "@/lib/actions/domain/order-fulfillment.actions";
import type {
  CategorySummaryItem,
  OrderPrintItem,
} from "@/lib/actions/domain/order-fulfillment.actions";

interface PrintListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrderIds: Set<string>;
}

/** 주문처리 리스트 출력 다이얼로그 */
export function PrintListDialog({ open, onOpenChange, selectedOrderIds }: PrintListDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [categorySummary, setCategorySummary] = useState<CategorySummaryItem[]>([]);
  const [orderItems, setOrderItems] = useState<OrderPrintItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadPrintData = useCallback(() => {
    if (selectedOrderIds.size === 0) {
      toast.warning("출력할 주문을 선택해 주세요.");
      return;
    }

    startTransition(async () => {
      const result = await fetchPrintData({ order_ids: [...selectedOrderIds] });
      if (result.ok) {
        setCategorySummary(result.data.categorySummary);
        setOrderItems(result.data.orderItems);
        setLoaded(true);
      } else {
        toast.error(result.error.message);
      }
    });
  }, [selectedOrderIds]);

  // 다이얼로그 열릴 때 데이터 로드
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen);
      if (nextOpen && !loaded) {
        loadPrintData();
      }
      if (!nextOpen) {
        setLoaded(false);
        setCategorySummary([]);
        setOrderItems([]);
      }
    },
    [onOpenChange, loaded, loadPrintData]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-auto print:max-w-none print:overflow-visible">
        <DialogHeader className="print:hidden">
          <DialogTitle>주문처리 리스트 출력</DialogTitle>
        </DialogHeader>

        {isPending && (
          <div className="flex h-40 items-center justify-center">
            <span className="text-muted-foreground text-sm">데이터를 불러오는 중...</span>
          </div>
        )}

        {!isPending && loaded && (
          <div className="space-y-6">
            {/* 출력 버튼 */}
            <div className="flex justify-end print:hidden">
              <Button size="sm" onClick={() => window.print()} className="gap-1.5">
                <Printer className="h-4 w-4" />
                인쇄
              </Button>
            </div>

            {/* Panel 1: 카테고리별 상품/수량 집계 */}
            <section>
              <h2 className="mb-2 text-sm font-semibold">
                피킹리스트 (카테고리별 집계) — {new Date().toLocaleString("ko-KR")}
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">카테고리</TableHead>
                    <TableHead>상품명</TableHead>
                    <TableHead className="w-20 text-center">수량(합계)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categorySummary.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-muted-foreground py-8 text-center">
                        데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    categorySummary.map((item) => (
                      <TableRow key={`${item.category}-${item.item_id}`}>
                        <TableCell className="text-xs">{item.category}</TableCell>
                        <TableCell className="text-xs">{item.item_name}</TableCell>
                        <TableCell className="text-center text-xs font-medium">
                          {item.total_qty}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </section>

            {/* 페이지 구분선 (인쇄 시) */}
            <div className="hidden print:block print:break-before-page" />

            {/* Panel 2: 주문별 상품/수량 상세 */}
            <section>
              <h2 className="mb-2 text-sm font-semibold">주문별 상세 리스트</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-36">주문번호</TableHead>
                    <TableHead className="w-20">회원명</TableHead>
                    <TableHead>상품명</TableHead>
                    <TableHead className="w-16 text-center">수량</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground py-8 text-center">
                        데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orderItems.flatMap((order) =>
                      order.items.map((item, idx) => (
                        <TableRow key={`${order.order_id}-${idx}`}>
                          {idx === 0 ? (
                            <>
                              <TableCell
                                className="align-top font-mono text-xs"
                                rowSpan={order.items.length}
                              >
                                {order.order_no}
                              </TableCell>
                              <TableCell className="align-top text-xs" rowSpan={order.items.length}>
                                {order.customer_name}
                              </TableCell>
                            </>
                          ) : null}
                          <TableCell className="text-xs">{item.item_name}</TableCell>
                          <TableCell className="text-center text-xs font-medium">
                            {item.qty}
                          </TableCell>
                        </TableRow>
                      ))
                    )
                  )}
                </TableBody>
              </Table>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
