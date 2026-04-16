// F006: 피킹리스트 출력
export const dynamic = "force-dynamic";

import { PageTitleBar } from "@/components/contents/page-title-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createAdminClient } from "@/lib/supabase/admin";
import { PickingTaskRepository } from "@/lib/repositories/picking-task.repository";
import { PickingItemRepository } from "@/lib/repositories/picking-item.repository";
import { PrintButton } from "@/app/(admin)/orders/print/print-button";
import type { Database } from "@/lib/supabase/database.types";

type PickingTaskRow = Database["public"]["Tables"]["picking_task"]["Row"];
type PickingItemRow = Database["public"]["Tables"]["picking_item"]["Row"];

interface TaskWithItems {
  task: PickingTaskRow;
  items: PickingItemRow[];
}

export default async function OrdersPrintPage() {
  const supabase = createAdminClient();
  const taskRepo = new PickingTaskRepository(supabase);
  const itemRepo = new PickingItemRepository(supabase);

  // 전체 피킹 작업 조회
  const tasks = await taskRepo.findAll({ sortBy: "created_at", sortOrder: "desc" });

  // 각 작업의 피킹 항목을 병렬로 조회
  const tasksWithItems: TaskWithItems[] = await Promise.all(
    tasks.map(async (task) => {
      const items = await itemRepo.findByTaskId(task.task_id);
      return { task, items };
    })
  );

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
        <div className="mb-4 flex items-center justify-between print:hidden">
          <span className="text-muted-foreground text-sm">
            총 {tasks.length}개 작업 / {tasksWithItems.reduce((s, t) => s + t.items.length, 0)}개
            항목
          </span>
          {/* 클라이언트에서 window.print() 호출하는 버튼 */}
          <PrintButton />
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
                  <TableHead>태스크 ID</TableHead>
                  <TableHead>주문 ID</TableHead>
                  <TableHead>피커 ID</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>항목 ID</TableHead>
                  <TableHead className="text-center">요청수량</TableHead>
                  <TableHead className="text-center">피킹수량</TableHead>
                  <TableHead>결과</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasksWithItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-muted-foreground py-8 text-center text-sm"
                    >
                      피킹 데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  tasksWithItems.flatMap(({ task, items }) =>
                    items.length === 0 ? (
                      <TableRow key={task.task_id}>
                        <TableCell className="text-xs">{task.task_id.slice(0, 8)}…</TableCell>
                        <TableCell className="text-xs">{task.order_id.slice(0, 8)}…</TableCell>
                        <TableCell className="text-xs">
                          {task.picker_id?.slice(0, 8) ?? "-"}
                        </TableCell>
                        <TableCell className="text-xs">{task.status}</TableCell>
                        <TableCell
                          colSpan={4}
                          className="text-muted-foreground text-center text-xs"
                        >
                          항목 없음
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item, idx) => (
                        <TableRow key={`${task.task_id}-${item.picking_item_id}`}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {idx === 0 ? `${task.task_id.slice(0, 8)}…` : ""}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {idx === 0 ? `${task.order_id.slice(0, 8)}…` : ""}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {idx === 0 ? (task.picker_id?.slice(0, 8) ?? "-") : ""}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {idx === 0 ? task.status : ""}
                          </TableCell>
                          <TableCell className="text-xs">
                            {item.picking_item_id.slice(0, 8)}…
                          </TableCell>
                          <TableCell className="text-center">{item.requested_qty}</TableCell>
                          <TableCell className="text-center">{item.picked_qty}</TableCell>
                          <TableCell className="text-xs">{item.result ?? "-"}</TableCell>
                        </TableRow>
                      ))
                    )
                  )
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
