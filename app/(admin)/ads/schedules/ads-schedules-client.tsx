"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { DateRangePicker } from "@/components/admin/domain/date-range-picker";
import { createAdSchedule } from "@/lib/actions/domain/ad.actions";
import type { AdScheduleRow } from "@/lib/types/domain/advertisement";
import type { PaginatedResult } from "@/lib/types/api";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

// MON~SUN 요일 상수
const DAYS_OF_WEEK = [
  { value: "MON", label: "월" },
  { value: "TUE", label: "화" },
  { value: "WED", label: "수" },
  { value: "THU", label: "목" },
  { value: "FRI", label: "금" },
  { value: "SAT", label: "토" },
  { value: "SUN", label: "일" },
];

const scheduleFormSchema = z.object({
  content_id: z.string().min(1, "콘텐츠 ID를 입력하세요"),
  store_id: z.string().min(1, "스토어 ID를 입력하세요"),
  start_at: z.string().min(1, "시작일을 입력하세요"),
  end_at: z.string().min(1, "종료일을 입력하세요"),
  time_start: z.string().optional(),
  time_end: z.string().optional(),
  dow_mask: z.array(z.string()).min(1, "요일을 하나 이상 선택하세요"),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

const SCHED_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: "예약", className: "bg-blue-50 text-blue-700 border-blue-200" },
  ACTIVE: { label: "활성", className: "bg-primary-light text-primary border-primary/30" },
  PAUSED: { label: "일시정지", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  ENDED: { label: "종료", className: "bg-disabled text-text-placeholder border-separator" },
};

const columns: DataTableColumn<AdScheduleRow>[] = [
  { key: "schedule_id", header: "일정 ID", className: "w-28" },
  { key: "content_id", header: "콘텐츠 ID" },
  { key: "start_at", header: "시작일", render: (row) => row.start_at?.slice(0, 10) ?? "-" },
  { key: "end_at", header: "종료일", render: (row) => row.end_at?.slice(0, 10) ?? "-" },
  { key: "time_start", header: "시작 시간", render: (row) => row.time_start ?? "-" },
  { key: "time_end", header: "종료 시간", render: (row) => row.time_end ?? "-" },
  { key: "dow_mask", header: "요일", render: (row) => row.dow_mask ?? "-" },
  {
    key: "status",
    header: "상태",
    render: (row) => {
      const cfg = SCHED_STATUS_CONFIG[row.status ?? ""] ?? {
        label: row.status ?? "-",
        className: "",
      };
      return (
        <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>
          {cfg.label}
        </Badge>
      );
    },
  },
];

interface AdsSchedulesClientProps {
  initialData: PaginatedResult<AdScheduleRow>;
}

export function AdsSchedulesClient({ initialData }: AdsSchedulesClientProps) {
  const router = useRouter();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      content_id: "",
      store_id: "",
      start_at: "",
      end_at: "",
      time_start: "08:00",
      time_end: "22:00",
      dow_mask: [],
    },
  });

  const handleSubmit = async (values: ScheduleFormValues) => {
    // DOW 마스크: 선택된 요일을 콤마 구분 문자열로 저장 (MON,TUE,WED ...)
    const dowMaskStr = values.dow_mask.join(",");

    const result = await createAdSchedule({
      content_id: values.content_id,
      store_id: values.store_id,
      start_at: values.start_at,
      end_at: values.end_at,
      time_start: values.time_start || null,
      time_end: values.time_end || null,
      dow_mask: dowMaskStr,
    });

    if (result.ok) {
      toast.success("광고 일정이 등록되었습니다.");
      setRegisterOpen(false);
      form.reset();
      router.refresh();
    } else {
      toast.error(result.error.message ?? "등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <DateRangePicker
          from={dateFrom}
          to={dateTo}
          onFromChange={setDateFrom}
          onToChange={setDateTo}
        />
      </div>

      <DataTable
        columns={columns}
        data={initialData.data}
        rowKey={(row) => row.schedule_id}
        searchPlaceholder="일정 ID·콘텐츠 ID 검색"
        toolbarActions={
          <Button size="sm" onClick={() => setRegisterOpen(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            일정 등록
          </Button>
        }
        showRowActions={false}
      />

      <LayerDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        title="광고 일정 등록"
        size="md"
        onConfirm={form.handleSubmit(handleSubmit)}
        confirmLabel="등록"
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="content_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>콘텐츠 ID *</FormLabel>
                  <FormControl>
                    <Input placeholder="콘텐츠 UUID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="store_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>스토어 ID *</FormLabel>
                  <FormControl>
                    <Input placeholder="스토어 UUID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="start_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시작일 *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>종료일 *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>시작 시간</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>종료 시간</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="dow_mask"
              render={() => (
                <FormItem>
                  <FormLabel>요일 *</FormLabel>
                  <div className="flex flex-wrap gap-3 pt-1">
                    {DAYS_OF_WEEK.map((day) => (
                      <FormField
                        key={day.value}
                        control={form.control}
                        name="dow_mask"
                        render={({ field }) => (
                          <div className="flex items-center gap-1.5">
                            <Checkbox
                              id={`dow-${day.value}`}
                              checked={field.value?.includes(day.value)}
                              onCheckedChange={(checked) => {
                                const current = field.value ?? [];
                                if (checked) {
                                  field.onChange([...current, day.value]);
                                } else {
                                  field.onChange(current.filter((v) => v !== day.value));
                                }
                              }}
                            />
                            <Label htmlFor={`dow-${day.value}`}>{day.label}</Label>
                          </div>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </LayerDialog>
    </div>
  );
}
