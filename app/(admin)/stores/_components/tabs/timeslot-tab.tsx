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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import {
  createQuickTimeslot,
  updateQuickTimeslot,
  deleteQuickTimeslot,
} from "@/lib/actions/domain/store-quick-timeslot.actions";
import type { Database } from "@/lib/supabase/database.types";

type StoreQuickTimeslotRow = Database["public"]["Tables"]["store_quick_time_slot"]["Row"];

const DAY_TYPE_OPTIONS = [
  { value: "ALL", label: "전체" },
  { value: "WEEKDAY", label: "평일" },
  { value: "WEEKEND", label: "주말" },
] as const;

const timeslotFormSchema = z.object({
  depart_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "HH:MM 형식으로 입력하세요"),
  day_type: z.string().min(1),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type TimeslotFormValues = z.infer<typeof timeslotFormSchema>;

interface TimeslotTabProps {
  storeId: string;
  timeslots: StoreQuickTimeslotRow[];
  onDataChange: (data: StoreQuickTimeslotRow[]) => void;
}

export function TimeslotTab({ storeId, timeslots, onDataChange }: TimeslotTabProps) {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StoreQuickTimeslotRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StoreQuickTimeslotRow | null>(null);

  const form = useForm<TimeslotFormValues>({
    resolver: zodResolver(timeslotFormSchema),
    defaultValues: {
      depart_time: "",
      day_type: "ALL",
      status: "ACTIVE",
    },
  });

  const columns: DataTableColumn<StoreQuickTimeslotRow>[] = [
    {
      key: "depart_time",
      header: "출발 시간",
      render: (row) => (row.depart_time as string).slice(0, 5),
    },
    {
      key: "day_type",
      header: "운행 요일",
      render: (row) =>
        DAY_TYPE_OPTIONS.find((o) => o.value === row.day_type)?.label ?? row.day_type ?? "-",
    },
    {
      key: "status",
      header: "상태",
      render: (row) => (
        <DomainBadge type="store" status={row.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"} />
      ),
    },
  ];

  const openRegister = () => {
    form.reset({ depart_time: "", day_type: "ALL", status: "ACTIVE" });
    setRegisterOpen(true);
  };

  const openEdit = (row: StoreQuickTimeslotRow) => {
    form.reset({
      depart_time: (row.depart_time as string).slice(0, 5),
      day_type: row.day_type ?? "ALL",
      status: (row.status as "ACTIVE" | "INACTIVE") ?? "ACTIVE",
    });
    setEditTarget(row);
  };

  const handleSubmit = async (values: TimeslotFormValues) => {
    if (editTarget) {
      const result = await updateQuickTimeslot({ schedule_id: editTarget.schedule_id, ...values });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("운행표가 수정되었습니다.");
      onDataChange(
        timeslots.map((t) =>
          t.schedule_id === editTarget.schedule_id ? (result.data as StoreQuickTimeslotRow) : t
        )
      );
      setEditTarget(null);
    } else {
      const result = await createQuickTimeslot({ store_id: storeId, ...values });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("운행표가 추가되었습니다.");
      onDataChange([...timeslots, result.data as StoreQuickTimeslotRow]);
      setRegisterOpen(false);
    }
    form.reset();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteQuickTimeslot({ schedule_id: deleteTarget.schedule_id });
    if (!result.ok) {
      toast.error(result.error.message);
      setDeleteTarget(null);
      return;
    }
    toast.success("운행표가 삭제되었습니다.");
    onDataChange(timeslots.filter((t) => t.schedule_id !== deleteTarget.schedule_id));
    setDeleteTarget(null);
  };

  const isDialogOpen = registerOpen || editTarget !== null;

  return (
    <div>
      <DataTable
        columns={columns}
        data={timeslots}
        rowKey={(row) => row.schedule_id}
        toolbarActions={
          <Button size="sm" variant="outline-gray" onClick={openRegister}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            추가
          </Button>
        }
        showRowActions
        onRowEdit={openEdit}
        onRowDelete={(row) => setDeleteTarget(row)}
        emptyMessage="운행표가 없습니다."
      />

      <LayerDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRegisterOpen(false);
            setEditTarget(null);
          }
        }}
        title={editTarget ? "운행표 수정" : "운행표 추가"}
        onConfirm={form.handleSubmit(handleSubmit)}
        confirmLabel={editTarget ? "수정" : "추가"}
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="depart_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>출발 시간 *</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="day_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>운행 요일</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DAY_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상태</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">활성</SelectItem>
                      <SelectItem value="INACTIVE">비활성</SelectItem>
                    </SelectContent>
                  </Select>
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
        title="운행표 삭제"
        description={`출발 ${(deleteTarget?.depart_time as string | null)?.slice(0, 5) ?? ""} 운행표를 삭제하시겠습니까?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
