"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { LayerDialog } from "@/components/admin/layer-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  createSlotUsage,
  updateSlotUsage,
  deleteSlotUsage,
} from "@/lib/actions/domain/store-quick-slot-usage.actions";
import type { Database } from "@/lib/supabase/database.types";

type StoreQuickSlotUsageRow = Database["public"]["Tables"]["store_quick_slot_usage"]["Row"];

const slotUsageFormSchema = z.object({
  depart_date: z.string().min(1, "출발 날짜를 입력하세요"),
  depart_time: z.string().min(1, "출발 시간을 입력하세요"),
  reserved_count: z.number().int().min(0),
});

function numOnChange(fieldOnChange: (v: number) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    fieldOnChange(e.target.valueAsNumber);
  };
}

type SlotUsageFormValues = z.infer<typeof slotUsageFormSchema>;

interface SlotUsageTabProps {
  storeId: string;
  slotUsages: StoreQuickSlotUsageRow[];
  onDataChange: (data: StoreQuickSlotUsageRow[]) => void;
}

export function SlotUsageTab({ storeId, slotUsages, onDataChange }: SlotUsageTabProps) {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StoreQuickSlotUsageRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StoreQuickSlotUsageRow | null>(null);

  const form = useForm<SlotUsageFormValues>({
    resolver: zodResolver(slotUsageFormSchema),
    defaultValues: { depart_date: "", depart_time: "", reserved_count: 0 },
  });

  const columns: DataTableColumn<StoreQuickSlotUsageRow>[] = [
    { key: "depart_date", header: "출발 날짜" },
    { key: "depart_time", header: "출발 시간" },
    {
      key: "reserved_count",
      header: "예약 건수",
      render: (row) => (
        <span className={row.reserved_count === 0 ? "text-primary" : ""}>{row.reserved_count}</span>
      ),
    },
  ];

  const openRegister = () => {
    form.reset({ depart_date: "", depart_time: "", reserved_count: 0 });
    setRegisterOpen(true);
  };

  const openEdit = (row: StoreQuickSlotUsageRow) => {
    form.reset({
      depart_date: row.depart_date ?? "",
      depart_time: row.depart_time ?? "",
      reserved_count: row.reserved_count,
    });
    setEditTarget(row);
  };

  const handleSubmit = async (values: SlotUsageFormValues) => {
    if (editTarget) {
      const result = await updateSlotUsage({
        usage_id: editTarget.usage_id,
        reserved_count: values.reserved_count,
      });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("슬롯카운트가 수정되었습니다.");
      onDataChange(
        slotUsages.map((s) =>
          s.usage_id === editTarget.usage_id ? (result.data as StoreQuickSlotUsageRow) : s
        )
      );
      setEditTarget(null);
    } else {
      const result = await createSlotUsage({ store_id: storeId, ...values });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("슬롯카운트가 추가되었습니다.");
      onDataChange([...slotUsages, result.data as StoreQuickSlotUsageRow]);
      setRegisterOpen(false);
    }
    form.reset();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteSlotUsage({ usage_id: deleteTarget.usage_id });
    if (!result.ok) {
      toast.error(result.error.message);
      setDeleteTarget(null);
      return;
    }
    toast.success("슬롯카운트가 삭제되었습니다.");
    onDataChange(slotUsages.filter((s) => s.usage_id !== deleteTarget.usage_id));
    setDeleteTarget(null);
  };

  const isDialogOpen = registerOpen || editTarget !== null;

  return (
    <div>
      <DataTable
        columns={columns}
        data={slotUsages}
        rowKey={(row) => row.usage_id}
        toolbarActions={
          <Button size="sm" variant="outline-gray" onClick={openRegister}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            추가
          </Button>
        }
        showRowActions
        onRowEdit={openEdit}
        onRowDelete={(row) => setDeleteTarget(row)}
        emptyMessage="슬롯 사용량이 없습니다."
      />

      <LayerDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRegisterOpen(false);
            setEditTarget(null);
          }
        }}
        title={editTarget ? "슬롯카운트 수정" : "슬롯카운트 추가"}
        onConfirm={form.handleSubmit(handleSubmit)}
        confirmLabel={editTarget ? "수정" : "추가"}
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="depart_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>출발 날짜 *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="depart_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>출발 시간 *</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 10:00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reserved_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>예약 건수 *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={numOnChange(field.onChange)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </LayerDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="슬롯카운트 삭제"
        description="이 슬롯카운트를 삭제하시겠습니까?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
