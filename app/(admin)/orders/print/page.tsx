// F006: 피킹리스트 출력
"use client";

import { PageTitleBar } from "@/components/contents/page-title-bar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_PICKING_TASKS } from "@/lib/mocks/order";
import { Printer } from "lucide-react";

export default function OrdersPrintPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="print:hidden">
        <PageTitleBar
          title="피킹리스트 출력"
          screenNumber="34001"
          breadcrumbs={[{ label: "주문 처리" }, { label: "피킹리스트 출력" }]}
        />
      </div>
      <div className="p-6">
        <div className="mb-4 flex justify-end print:hidden">
          <Button onClick={handlePrint} variant="outline-gray">
            <Printer className="mr-2 h-4 w-4" />
            인쇄
          </Button>
        </div>

        <div className="print-area">
          <h2 className="mb-4 text-lg font-bold">피킹리스트</h2>
          <p className="text-text-placeholder mb-4 hidden text-sm print:block">
            출력일시: {new Date().toLocaleString("ko-KR")}
          </p>
          <div className="border-separator rounded border">
            <Table>
              <TableHeader>
                <TableRow className="bg-panel print:bg-gray-100">
                  <TableHead>주문번호</TableHead>
                  <TableHead>피커</TableHead>
                  <TableHead>상품명</TableHead>
                  <TableHead className="text-center">요청수량</TableHead>
                  <TableHead className="text-center">피킹수량</TableHead>
                  <TableHead>결과</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_PICKING_TASKS.flatMap((task) =>
                  task.items.map((item, idx) => (
                    <TableRow key={`${task.task_id}-${idx}`}>
                      <TableCell className="whitespace-nowrap">
                        {idx === 0 ? task.order_no : ""}
                      </TableCell>
                      <TableCell>{idx === 0 ? task.picker_name : ""}</TableCell>
                      <TableCell>{item.item_name}</TableCell>
                      <TableCell className="text-center">{item.requested_qty}</TableCell>
                      <TableCell className="text-center">{item.picked_qty}</TableCell>
                      <TableCell>{item.result ?? "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .print-hidden { display: none !important; }
          body { font-size: 12px; }
        }
      `}</style>
    </div>
  );
}
