"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import type { BbqAddressGroup } from "@/lib/repositories/shipment.repository";

interface ShipmentPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bbqGroups: BbqAddressGroup[];
}

/** BBQ 배송목록 출력 다이얼로그 */
export function ShipmentPrintDialog({ open, onOpenChange, bbqGroups }: ShipmentPrintDialogProps) {
  const printedAt = new Date().toLocaleString("ko-KR");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-auto print:max-w-none print:overflow-visible">
        <DialogHeader className="print:hidden">
          <DialogTitle>BBQ 배송목록 출력</DialogTitle>
        </DialogHeader>

        <div className="mb-2 flex justify-end print:hidden">
          <Button onClick={() => window.print()} size="sm" className="gap-1">
            <Printer className="h-4 w-4" />
            인쇄
          </Button>
        </div>

        {/* 인쇄 영역 */}
        <div className="text-xs print:text-sm">
          <div className="mb-4 border-b-2 pb-2">
            <h2 className="text-base font-bold print:text-xl">BBQ 배송목록</h2>
            <p className="text-gray-500">{printedAt} 출력</p>
          </div>

          {bbqGroups.length === 0 ? (
            <p className="py-8 text-center text-gray-400">BBQ 배송건이 없습니다.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">주소</th>
                  <th className="w-28 border border-gray-300 p-2 text-left">주문ID</th>
                  <th className="border border-gray-300 p-2 text-left">상품명</th>
                  <th className="w-14 border border-gray-300 p-2 text-center">수량</th>
                  <th className="w-36 border border-gray-300 p-2 text-left">주문일시</th>
                  <th className="w-32 border border-gray-300 p-2 text-left">배송예정</th>
                </tr>
              </thead>
              <tbody>
                {bbqGroups.flatMap((group) => {
                  const address =
                    group.address_text ??
                    (group.address_id === "UNKNOWN" ? "주소 미지정" : group.address_id);

                  return group.orders.flatMap((order, orderIdx) => {
                    const orderTime = order.ordered_at
                      ? order.ordered_at.slice(0, 16).replace("T", " ")
                      : "-";
                    const depart = order.quick_depart_date
                      ? `${order.quick_depart_date} ${order.quick_depart_time?.slice(0, 5) ?? ""}`
                      : "-";
                    const shortOrderId = `${order.order_id.slice(0, 8)}…`;

                    const rows = order.items.length === 0 ? [{ name: "-", qty: 0 }] : order.items;

                    return rows.map((item, itemIdx) => (
                      <tr
                        key={`${order.shipment_id}-${itemIdx}`}
                        className={
                          orderIdx === 0 && itemIdx === 0
                            ? "border-t-2 border-gray-400"
                            : "border-t border-gray-200"
                        }
                      >
                        {/* 주소: 그룹 첫 행에만 표시 */}
                        <td className="border border-gray-300 p-2 align-top font-medium">
                          {orderIdx === 0 && itemIdx === 0 ? address : ""}
                        </td>
                        {/* 주문ID: 주문 첫 행에만 표시 */}
                        <td className="border border-gray-300 p-2 align-top font-mono">
                          {itemIdx === 0 ? shortOrderId : ""}
                        </td>
                        <td className="border border-gray-300 p-2">{item.name}</td>
                        <td className="border border-gray-300 p-2 text-center">
                          {item.qty > 0 ? item.qty : "-"}
                        </td>
                        {/* 주문일시·배송예정: 주문 첫 행에만 표시 */}
                        <td className="border border-gray-300 p-2 align-top">
                          {itemIdx === 0 ? orderTime : ""}
                        </td>
                        <td className="border border-gray-300 p-2 align-top">
                          {itemIdx === 0 ? depart : ""}
                        </td>
                      </tr>
                    ));
                  });
                })}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
