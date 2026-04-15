"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { DateRangePicker } from "@/components/admin/domain/date-range-picker";
import { MOCK_PROMOTIONS } from "@/lib/mocks/promotion";
import type { PromotionRow } from "@/lib/types/domain/promotion";
import { Plus } from "lucide-react";

const promoFormSchema = z.object({
  name: z.string().min(1, "프로모션명을 입력하세요"),
  type: z.string().min(1, "유형을 선택하세요"),
  discount_value: z.number().optional(),
  start_at: z.string().min(1, "시작일을 입력하세요"),
  end_at: z.string().min(1, "종료일을 입력하세요"),
});

type PromoFormValues = z.infer<typeof promoFormSchema>;

const columns: DataTableColumn<PromotionRow>[] = [
  { key: "promo_id", header: "프로모션 ID", className: "w-32" },
  { key: "name", header: "프로모션명" },
  { key: "type", header: "유형" },
  {
    key: "status",
    header: "상태",
    render: (row) => <DomainBadge type="promotion" status={row.status ?? ""} />,
  },
  {
    key: "start_at",
    header: "시작일",
    render: (row) => row.start_at?.slice(0, 10) ?? "-",
  },
  {
    key: "end_at",
    header: "종료일",
    render: (row) => row.end_at?.slice(0, 10) ?? "-",
  },
];

export function PromotionsClient() {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const form = useForm<PromoFormValues>({
    resolver: zodResolver(promoFormSchema),
    defaultValues: { name: "", type: "", discount_value: 0, start_at: "", end_at: "" },
  });

  const filteredData = MOCK_PROMOTIONS.filter((p) => {
    if (typeFilter !== "ALL" && p.type !== typeFilter) return false;
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    return true;
  });

  const handleSubmit = (values: PromoFormValues) => {
    console.log("프로모션 저장:", values);
    toast.success("프로모션이 등록되었습니다.");
    setRegisterOpen(false);
    form.reset();
  };

  return (
    <div className="p-6">
      {/* 필터 영역 */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <DateRangePicker
          from={dateFrom}
          to={dateTo}
          onFromChange={setDateFrom}
          onToChange={setDateTo}
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue placeholder="유형" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 유형</SelectItem>
            <SelectItem value="SALE">세일</SelectItem>
            <SelectItem value="DISCOUNT_PCT">% 할인</SelectItem>
            <SelectItem value="DISCOUNT_FIXED">정액 할인</SelectItem>
            <SelectItem value="ONE_PLUS_ONE">1+1</SelectItem>
            <SelectItem value="TWO_PLUS_ONE">2+1</SelectItem>
            <SelectItem value="BUNDLE">묶음</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 상태</SelectItem>
            <SelectItem value="SCHEDULED">예약</SelectItem>
            <SelectItem value="ACTIVE">진행중</SelectItem>
            <SelectItem value="PAUSED">일시정지</SelectItem>
            <SelectItem value="ENDED">종료</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        rowKey={(row) => row.promo_id}
        searchPlaceholder="프로모션명 검색"
        toolbarActions={
          <Button size="sm" onClick={() => setRegisterOpen(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            프로모션 등록
          </Button>
        }
        showRowActions={false}
      />

      <LayerDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        title="프로모션 등록"
        size="md"
        onConfirm={form.handleSubmit(handleSubmit)}
        confirmLabel="등록"
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>프로모션명 *</FormLabel>
                  <FormControl>
                    <Input placeholder="프로모션명" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>유형 *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="유형 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SALE">세일</SelectItem>
                      <SelectItem value="DISCOUNT_PCT">% 할인</SelectItem>
                      <SelectItem value="DISCOUNT_FIXED">정액 할인</SelectItem>
                      <SelectItem value="ONE_PLUS_ONE">1+1</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discount_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>할인값</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
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
          </form>
        </Form>
      </LayerDialog>
    </div>
  );
}
