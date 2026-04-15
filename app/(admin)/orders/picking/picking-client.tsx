"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  getPickingItems,
  startPicking,
  completePicking,
} from "@/lib/actions/domain/fulfillment.actions";
import type { Database } from "@/lib/supabase/database.types";

type PickingTaskRow = Database["public"]["Tables"]["picking_task"]["Row"];
type PickingItemRow = Database["public"]["Tables"]["picking_item"]["Row"];
type ItemResult = "OK" | "SHORT" | "SUBSTITUTE";

// 피킹 항목 + 편집 상태
interface EditablePickingItem extends PickingItemRow {
  /** UI에서 편집 중인 picked_qty */
  editPickedQty: number;
  /** UI에서 편집 중인 result */
  editResult: ItemResult;
  /** SUBSTITUTE 선택 시 대체 상품 ID */
  editSubstituteId: string;
}

const columns: DataTableColumn<PickingTaskRow>[] = [
  { key: "task_id", header: "태스크 ID", className: "w-40 truncate" },
  { key: "order_id", header: "주문 ID", className: "w-40 truncate" },
  {
    key: "status",
    header: "상태",
    render: (row) => <DomainBadge type="picking" status={row.status} />,
  },
  {
    key: "picker_id",
    header: "피커 ID",
    render: (row) => <span className="text-xs">{row.picker_id ?? "-"}</span>,
  },
  {
    key: "created_at",
    header: "생성일시",
    render: (row) => row.created_at.slice(0, 16).replace("T", " "),
  },
];

interface PickingClientProps {
  initialData: PickingTaskRow[];
}

export function PickingClient({ initialData }: PickingClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedTask, setSelectedTask] = useState<PickingTaskRow | null>(null);
  const [items, setItems] = useState<EditablePickingItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // 행 클릭 → 피킹 항목 조회
  const handleRowClick = async (row: PickingTaskRow) => {
    setSelectedTask(row);
    setItemsLoading(true);
    setItems([]);

    const result = await getPickingItems({ task_id: row.task_id });
    if (result.ok && result.data) {
      setItems(
        result.data.map((item) => ({
          ...item,
          editPickedQty: item.picked_qty,
          editResult: item.result as ItemResult,
          editSubstituteId: item.substitute_product_id ?? "",
        }))
      );
    } else {
      toast.error("피킹 항목을 불러오지 못했습니다.");
    }
    setItemsLoading(false);
  };

  // 피킹 시작 (CREATED → PICKING)
  const handleStart = () => {
    if (!selectedTask) return;

    startTransition(async () => {
      // 피커 ID를 현재는 task의 picker_id 또는 임시 UUID 사용
      const pickerId = selectedTask.picker_id ?? "00000000-0000-4000-8000-000000000001";

      const result = await startPicking({
        task_id: selectedTask.task_id,
        picker_id: pickerId,
      });

      if (result.ok) {
        toast.success("피킹이 시작되었습니다.");
        setSelectedTask((prev) => (prev ? { ...prev, status: "PICKING" } : null));
        router.refresh();
      } else {
        toast.error(result.error?.message ?? "피킹 시작에 실패했습니다.");
      }
    });
  };

  // 피킹 완료 (PICKING → PICKED)
  const handleComplete = () => {
    if (!selectedTask || items.length === 0) {
      toast.error("피킹 항목이 없습니다.");
      return;
    }

    startTransition(async () => {
      const result = await completePicking({
        task_id: selectedTask.task_id,
        items: items.map((item) => ({
          picking_item_id: item.picking_item_id,
          picked_qty: item.editPickedQty,
          result: item.editResult,
          substitute_product_id:
            item.editResult === "SUBSTITUTE" && item.editSubstituteId
              ? item.editSubstituteId
              : null,
          memo: null,
        })),
      });

      if (result.ok) {
        toast.success("피킹이 완료 처리되었습니다.");
        setSelectedTask(null);
        setItems([]);
        router.refresh();
      } else {
        toast.error(result.error?.message ?? "피킹 완료에 실패했습니다.");
      }
    });
  };

  // 항목 수정
  const updateItem = (idx: number, patch: Partial<EditablePickingItem>) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={initialData}
        rowKey={(row) => row.task_id}
        searchPlaceholder="태스크 ID·주문 ID 검색"
        onRowClick={handleRowClick}
        showRowActions={false}
      />

      <Sheet open={selectedTask !== null} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <SheetContent className="w-[560px] sm:max-w-[560px]">
          <SheetHeader>
            <SheetTitle>피킹 상세</SheetTitle>
            <SheetDescription>
              태스크: {selectedTask?.task_id.slice(0, 8)}… / 상태: {selectedTask?.status ?? "-"}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {itemsLoading ? (
              <p className="text-muted-foreground py-8 text-center text-sm">항목 불러오는 중...</p>
            ) : (
              <div className="border-separator rounded border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-panel">
                      <TableHead>항목 ID</TableHead>
                      <TableHead className="w-20 text-center">요청</TableHead>
                      <TableHead className="w-24 text-center">피킹수량</TableHead>
                      <TableHead className="w-36">결과</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-muted-foreground py-6 text-center text-sm"
                        >
                          피킹 항목이 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item, idx) => (
                        <TableRow key={item.picking_item_id}>
                          <TableCell className="truncate text-xs">
                            {item.picking_item_id.slice(0, 8)}…
                          </TableCell>
                          <TableCell className="text-center">{item.requested_qty}</TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              className="h-7 w-20 text-center text-xs"
                              value={item.editPickedQty}
                              min={0}
                              onChange={(e) =>
                                updateItem(idx, { editPickedQty: Number(e.target.value) })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.editResult}
                              onValueChange={(v) =>
                                updateItem(idx, { editResult: v as ItemResult })
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
                            {/* SUBSTITUTE 선택 시 대체 상품 ID 입력 */}
                            {item.editResult === "SUBSTITUTE" && (
                              <Input
                                className="mt-1 h-7 text-xs"
                                placeholder="대체 상품 UUID"
                                value={item.editSubstituteId}
                                onChange={(e) =>
                                  updateItem(idx, { editSubstituteId: e.target.value })
                                }
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline-gray" size="sm" onClick={() => setSelectedTask(null)}>
                닫기
              </Button>
              {selectedTask?.status === "CREATED" && (
                <Button size="sm" variant="outline" onClick={handleStart} disabled={isPending}>
                  피킹 시작
                </Button>
              )}
              {(selectedTask?.status === "PICKING" || selectedTask?.status === "CREATED") && (
                <Button
                  size="sm"
                  onClick={handleComplete}
                  disabled={isPending || items.length === 0}
                >
                  피킹 완료
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
