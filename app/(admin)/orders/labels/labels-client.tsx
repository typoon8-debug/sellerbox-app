"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { MOCK_ORDERS } from "@/lib/mocks/order";

const LABEL_TYPES = [
  { value: "BOX", label: "박스 라벨" },
  { value: "BAG", label: "봉투 라벨" },
  { value: "INVOICE", label: "송장 라벨" },
];

function generateZpl(orderNo: string, type: string): string {
  return `^XA
^FO50,50^A0N,30,30^FD${type} LABEL^FS
^FO50,100^A0N,25,25^FD주문번호: ${orderNo}^FS
^FO50,140^A0N,20,20^FD출력일시: ${new Date().toLocaleString("ko-KR")}^FS
^XZ`;
}

export function LabelsClient() {
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const toggleOrder = (orderId: string) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const zplPreview =
    selectedOrders.size > 0 && selectedTypes.size > 0
      ? Array.from(selectedOrders)
          .flatMap((orderId) => {
            const order = MOCK_ORDERS.find((o) => o.order_id === orderId);
            return Array.from(selectedTypes).map((type) =>
              generateZpl(order?.order_no ?? orderId, type)
            );
          })
          .join("\n\n")
      : "";

  const handlePrint = () => {
    toast.success(`${selectedOrders.size}건 × ${selectedTypes.size}종 라벨 출력이 요청되었습니다.`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* 라벨 유형 선택 */}
      <div>
        <h3 className="mb-3 text-sm font-medium">라벨 유형 선택</h3>
        <div className="flex gap-4">
          {LABEL_TYPES.map((lt) => (
            <div key={lt.value} className="flex items-center gap-2">
              <Checkbox
                id={lt.value}
                checked={selectedTypes.has(lt.value)}
                onCheckedChange={() => toggleType(lt.value)}
              />
              <Label htmlFor={lt.value}>{lt.label}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* 주문 선택 */}
      <div>
        <h3 className="mb-3 text-sm font-medium">주문 선택</h3>
        <div className="border-separator divide-separator divide-y rounded border">
          {MOCK_ORDERS.map((order) => (
            <div key={order.order_id} className="flex items-center gap-3 px-4 py-2.5">
              <Checkbox
                id={`order-${order.order_id}`}
                checked={selectedOrders.has(order.order_id)}
                onCheckedChange={() => toggleOrder(order.order_id)}
              />
              <Label htmlFor={`order-${order.order_id}`} className="flex-1 cursor-pointer">
                <span className="font-medium">{order.order_no}</span>
                <span className="text-text-placeholder ml-2 text-sm">{order.customer_name}</span>
              </Label>
              <DomainBadge type="order" status={order.status ?? ""} />
            </div>
          ))}
        </div>
      </div>

      {/* ZPL 미리보기 */}
      {zplPreview && (
        <div>
          <h3 className="mb-2 text-sm font-medium">ZPL 미리보기</h3>
          <Textarea value={zplPreview} readOnly rows={10} className="font-mono text-xs" />
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handlePrint}
          disabled={selectedOrders.size === 0 || selectedTypes.size === 0}
        >
          라벨 출력
        </Button>
      </div>
    </div>
  );
}
