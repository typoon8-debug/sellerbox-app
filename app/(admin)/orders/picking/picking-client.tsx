"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { MOCK_PICKING_TASKS } from "@/lib/mocks/order";

type PickingTask = (typeof MOCK_PICKING_TASKS)[number];

const columns: DataTableColumn<PickingTask>[] = [
  { key: "task_id", header: "태스크 ID", className: "w-28" },
  { key: "order_no", header: "주문번호" },
  { key: "picker_name", header: "피커" },
  {
    key: "status",
    header: "상태",
    render: (row) => <DomainBadge type="picking" status={row.status} />,
  },
  {
    key: "created_at",
    header: "생성일시",
    render: (row) => row.created_at.slice(0, 16).replace("T", " "),
  },
];

type ItemResult = "OK" | "SHORT" | "SUBSTITUTE" | null;

export function PickingClient() {
  const [selectedTask, setSelectedTask] = useState<PickingTask | null>(null);
  const [itemResults, setItemResults] = useState<Record<string, ItemResult>>({});

  const handleRowClick = (row: PickingTask) => {
    setSelectedTask(row);
    const initResults: Record<string, ItemResult> = {};
    row.items.forEach((item, idx) => {
      initResults[String(idx)] = (item.result as ItemResult) ?? null;
    });
    setItemResults(initResults);
  };

  const handleComplete = () => {
    toast.success("피킹이 완료 처리되었습니다.");
    setSelectedTask(null);
  };

  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={MOCK_PICKING_TASKS}
        rowKey={(row) => row.task_id}
        searchPlaceholder="주문번호·피커 검색"
        onRowClick={handleRowClick}
        showRowActions={false}
      />

      <Sheet open={selectedTask !== null} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <SheetContent className="w-[500px] sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>피킹 상세</SheetTitle>
            <SheetDescription>
              주문번호: {selectedTask?.order_no} / 피커: {selectedTask?.picker_name}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="border-separator rounded border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-panel">
                    <TableHead>상품명</TableHead>
                    <TableHead className="w-20 text-center">요청수량</TableHead>
                    <TableHead className="w-20 text-center">피킹수량</TableHead>
                    <TableHead className="w-32">결과</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedTask?.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-sm">{item.item_name}</TableCell>
                      <TableCell className="text-center">{item.requested_qty}</TableCell>
                      <TableCell className="text-center">{item.picked_qty}</TableCell>
                      <TableCell>
                        <Select
                          value={itemResults[String(idx)] ?? ""}
                          onValueChange={(v) =>
                            setItemResults((prev) => ({ ...prev, [String(idx)]: v as ItemResult }))
                          }
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder="결과 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OK">OK</SelectItem>
                            <SelectItem value="SHORT">SHORT</SelectItem>
                            <SelectItem value="SUBSTITUTE">SUBSTITUTE</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline-gray" size="sm" onClick={() => setSelectedTask(null)}>
                닫기
              </Button>
              <Button size="sm" onClick={handleComplete}>
                피킹 완료
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
