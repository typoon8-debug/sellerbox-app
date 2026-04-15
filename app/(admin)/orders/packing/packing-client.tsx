"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { completePacking } from "@/lib/actions/domain/fulfillment.actions";
import type { Database } from "@/lib/supabase/database.types";

type PackingTaskRow = Database["public"]["Tables"]["packing_task"]["Row"];

/** 패킹 완료 폼 스키마 — packing_weight 필수, 양수 */
const packingFormSchema = z.object({
  packing_weight: z.number().positive("중량은 0보다 커야 합니다."),
});

type PackingFormValues = z.infer<typeof packingFormSchema>;

const columns: DataTableColumn<PackingTaskRow>[] = [
  { key: "pack_id", header: "패킹 ID", className: "w-40 truncate" },
  { key: "order_id", header: "주문 ID", className: "w-40 truncate" },
  {
    key: "status",
    header: "상태",
    render: (row) => <DomainBadge type="packing" status={row.status} />,
  },
  {
    key: "packing_weight",
    header: "중량(g)",
    render: (row) => (row.packing_weight !== null ? `${row.packing_weight}g` : "-"),
  },
  {
    key: "completed_at",
    header: "완료일시",
    render: (row) => (row.completed_at ? row.completed_at.slice(0, 16).replace("T", " ") : "-"),
  },
];

interface PackingClientProps {
  initialData: PackingTaskRow[];
}

export function PackingClient({ initialData }: PackingClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTask, setSelectedTask] = useState<PackingTaskRow | null>(null);

  const form = useForm<PackingFormValues>({
    resolver: zodResolver(packingFormSchema),
    defaultValues: { packing_weight: 0 },
  });

  const handleRowClick = (row: PackingTaskRow) => {
    // PACKED 상태는 편집 불가
    if (row.status === "PACKED") {
      toast.info("이미 완료된 패킹 작업입니다.");
      return;
    }
    setSelectedTask(row);
    form.reset({ packing_weight: row.packing_weight ?? 0 });
  };

  const handleComplete = (values: PackingFormValues) => {
    if (!selectedTask) return;

    startTransition(async () => {
      const result = await completePacking({
        pack_id: selectedTask.pack_id,
        packing_weight: values.packing_weight,
      });

      if (result.ok) {
        toast.success(`패킹 완료 처리되었습니다. (중량: ${values.packing_weight}g)`);
        setSelectedTask(null);
        form.reset();
        router.refresh();
      } else {
        toast.error(result.error?.message ?? "패킹 완료에 실패했습니다.");
      }
    });
  };

  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={initialData}
        rowKey={(row) => row.pack_id}
        searchPlaceholder="패킹 ID·주문 ID 검색"
        toolbarActions={<span className="text-muted-foreground text-sm">패킹 대기 목록</span>}
        onRowClick={handleRowClick}
        showRowActions={false}
      />

      {/* 패킹 완료 Sheet */}
      <Sheet open={selectedTask !== null} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <SheetContent className="w-[400px] sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>패킹 완료 처리</SheetTitle>
            <SheetDescription>
              패킹 ID: {selectedTask?.pack_id.slice(0, 8)}… / 주문:{" "}
              {selectedTask?.order_id.slice(0, 8)}…
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleComplete)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="packing_weight"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <label className="w-24 text-sm font-medium">중량(g) *</label>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="중량 입력 (필수)"
                            className="flex-1"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="pl-24" />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline-gray"
                    size="sm"
                    onClick={() => setSelectedTask(null)}
                  >
                    취소
                  </Button>
                  <Button type="submit" size="sm" disabled={isPending}>
                    {isPending ? "처리 중..." : "패킹 완료"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
