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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { LayerDialog } from "@/components/admin/layer-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  createAdSchedule,
  updateAdSchedule,
  deleteAdSchedule,
} from "@/lib/actions/domain/ad.actions";
import type { AdScheduleRow } from "@/lib/types/domain/advertisement";

const DOW_OPTIONS = [
  { value: "MON", label: "월" },
  { value: "TUE", label: "화" },
  { value: "WED", label: "수" },
  { value: "THU", label: "목" },
  { value: "FRI", label: "금" },
  { value: "SAT", label: "토" },
  { value: "SUN", label: "일" },
];

const formSchema = z.object({
  start_at: z.string().min(1, "시작일을 입력하세요"),
  end_at: z.string().min(1, "종료일을 입력하세요"),
  time_start: z.string().optional().nullable(),
  time_end: z.string().optional().nullable(),
  dow_mask: z.string().optional().nullable(),
  status: z.enum(["SCHEDULED", "ACTIVE", "PAUSED", "ENDED"]),
});

type FormValues = z.infer<typeof formSchema>;

interface ScheduleTabProps {
  contentId: string;
  storeId: string;
  schedules: AdScheduleRow[];
  onDataChange: (data: AdScheduleRow[]) => void;
}

export function ScheduleTab({ contentId, storeId, schedules, onDataChange }: ScheduleTabProps) {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdScheduleRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdScheduleRow | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      start_at: "",
      end_at: "",
      time_start: "",
      time_end: "",
      dow_mask: "",
      status: "SCHEDULED",
    },
  });

  const columns: DataTableColumn<AdScheduleRow>[] = [
    {
      key: "schedule_id",
      header: "일정ID",
      className: "w-28 truncate text-xs text-muted-foreground",
    },
    { key: "start_at", header: "시작일시", render: (row) => row.start_at?.slice(0, 16) ?? "-" },
    { key: "end_at", header: "종료일시", render: (row) => row.end_at?.slice(0, 16) ?? "-" },
    { key: "time_start", header: "시작시간", render: (row) => row.time_start ?? "-" },
    { key: "time_end", header: "종료시간", render: (row) => row.time_end ?? "-" },
    { key: "dow_mask", header: "요일", render: (row) => row.dow_mask ?? "전체" },
    { key: "status", header: "상태" },
  ];

  const openRegister = () => {
    form.reset({
      start_at: "",
      end_at: "",
      time_start: "",
      time_end: "",
      dow_mask: "",
      status: "SCHEDULED",
    });
    setRegisterOpen(true);
  };

  const openEdit = (row: AdScheduleRow) => {
    form.reset({
      start_at: row.start_at?.slice(0, 16) ?? "",
      end_at: row.end_at?.slice(0, 16) ?? "",
      time_start: row.time_start ?? "",
      time_end: row.time_end ?? "",
      dow_mask: row.dow_mask ?? "",
      status: row.status as FormValues["status"],
    });
    setEditTarget(row);
  };

  const handleSubmit = async (values: FormValues) => {
    if (editTarget) {
      const result = await updateAdSchedule({ schedule_id: editTarget.schedule_id, ...values });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("일정이 수정되었습니다.");
      onDataChange(
        schedules.map((s) =>
          s.schedule_id === editTarget.schedule_id ? (result.data as AdScheduleRow) : s
        )
      );
      setEditTarget(null);
    } else {
      const result = await createAdSchedule({
        content_id: contentId,
        store_id: storeId,
        ...values,
      });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("일정이 등록되었습니다.");
      onDataChange([...schedules, result.data as AdScheduleRow]);
      setRegisterOpen(false);
    }
    form.reset();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteAdSchedule({ schedule_id: deleteTarget.schedule_id });
    if (!result.ok) {
      toast.error(result.error.message);
      setDeleteTarget(null);
      return;
    }
    toast.success("일정이 삭제되었습니다.");
    onDataChange(schedules.filter((s) => s.schedule_id !== deleteTarget.schedule_id));
    setDeleteTarget(null);
  };

  const isDialogOpen = registerOpen || editTarget !== null;

  return (
    <div>
      <DataTable
        columns={columns}
        data={schedules}
        rowKey={(row) => row.schedule_id}
        toolbarActions={
          <Button size="sm" variant="outline-gray" onClick={openRegister}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            일정 추가
          </Button>
        }
        showRowActions
        onRowEdit={openEdit}
        onRowDelete={(row) => setDeleteTarget(row)}
        emptyMessage="등록된 일정이 없습니다."
      />

      <LayerDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRegisterOpen(false);
            setEditTarget(null);
          }
        }}
        title={editTarget ? "일정 수정" : "일정 추가"}
        onConfirm={form.handleSubmit(handleSubmit)}
        confirmLabel={editTarget ? "수정" : "추가"}
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="start_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시작일시 *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>종료일시 *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="time_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>노출 시작 시간</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value ?? ""} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>노출 종료 시간</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value ?? ""} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dow_mask"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>요일 마스크 (쉼표 구분)</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {DOW_OPTIONS.map((d) => {
                      const selected = (field.value ?? "")
                        .split(",")
                        .filter(Boolean)
                        .includes(d.value);
                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => {
                            const current = (field.value ?? "").split(",").filter(Boolean);
                            const next = selected
                              ? current.filter((v) => v !== d.value)
                              : [...current, d.value];
                            field.onChange(next.join(","));
                          }}
                          className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input bg-background text-foreground hover:bg-accent"
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
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
                      <SelectItem value="SCHEDULED">예약됨</SelectItem>
                      <SelectItem value="ACTIVE">활성</SelectItem>
                      <SelectItem value="PAUSED">일시정지</SelectItem>
                      <SelectItem value="ENDED">종료</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </LayerDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="일정 삭제"
        description="이 일정을 삭제하시겠습니까?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
