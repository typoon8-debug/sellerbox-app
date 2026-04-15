"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { LayerDialog } from "@/components/admin/layer-dialog";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { updateCsTicket } from "@/lib/actions/domain/support.actions";
import type { CsTicketRow } from "@/lib/types/domain/support";
import type { PaginatedResult } from "@/lib/types/api";

// 티켓 유형 라벨 매핑
const TICKET_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  REFUND: { label: "환불", className: "bg-alert-red-bg text-alert-red border-alert-red/30" },
  EXCHANGE: { label: "교환", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  INQUIRY: { label: "문의", className: "bg-blue-50 text-blue-700 border-blue-200" },
};

const actionFormSchema = z.object({
  cs_action: z.string().min(1, "처리 결과를 입력하세요"),
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]),
});

type ActionFormValues = z.infer<typeof actionFormSchema>;

const columns: DataTableColumn<CsTicketRow>[] = [
  { key: "ticket_id", header: "티켓 ID", className: "w-28" },
  {
    key: "type",
    header: "유형",
    render: (row) => {
      const cfg = TICKET_TYPE_CONFIG[row.type ?? ""] ?? {
        label: row.type ?? "-",
        className: "",
      };
      return (
        <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>
          {cfg.label}
        </Badge>
      );
    },
  },
  {
    key: "status",
    header: "상태",
    render: (row) => <DomainBadge type="csTicket" status={row.status ?? ""} />,
  },
  { key: "customer_id", header: "고객 ID" },
  {
    key: "cs_contents",
    header: "내용",
    render: (row) => (
      <span className="block max-w-xs truncate text-sm">{row.cs_contents ?? "-"}</span>
    ),
  },
  {
    key: "created_at",
    header: "접수일시",
    render: (row) => row.created_at?.slice(0, 16).replace("T", " ") ?? "-",
  },
];

interface CsClientProps {
  initialData: PaginatedResult<CsTicketRow>;
  initialType: string;
  initialStatus: string;
}

export function CsClient({ initialData, initialType, initialStatus }: CsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedTicket, setSelectedTicket] = useState<CsTicketRow | null>(null);

  const form = useForm<ActionFormValues>({
    resolver: zodResolver(actionFormSchema),
    defaultValues: { cs_action: "", status: "IN_PROGRESS" },
  });

  // 필터 변경 시 URL 파라미터 업데이트 → 서버 재조회
  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    startTransition(() => {
      const params = new URLSearchParams();
      if (value !== "ALL") params.set("type", value);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      router.push(`?${params.toString()}`);
    });
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    startTransition(() => {
      const params = new URLSearchParams();
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (value !== "ALL") params.set("status", value);
      router.push(`?${params.toString()}`);
    });
  };

  const openDetail = (row: CsTicketRow) => {
    form.reset({
      cs_action: row.cs_action ?? "",
      status: (row.status as ActionFormValues["status"]) ?? "OPEN",
    });
    setSelectedTicket(row);
  };

  const handleSubmit = async (values: ActionFormValues) => {
    if (!selectedTicket) return;

    const result = await updateCsTicket({
      ticket_id: selectedTicket.ticket_id,
      status: values.status,
      cs_action: values.cs_action,
    });

    if (result.ok) {
      toast.success("CS 티켓이 처리되었습니다.");
      setSelectedTicket(null);
      form.reset();
      router.refresh();
    } else {
      toast.error(result.error.message ?? "처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-6">
      {/* 필터 영역 */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={typeFilter} onValueChange={handleTypeFilter} disabled={isPending}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="유형" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 유형</SelectItem>
            <SelectItem value="REFUND">환불</SelectItem>
            <SelectItem value="EXCHANGE">교환</SelectItem>
            <SelectItem value="INQUIRY">문의</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={handleStatusFilter} disabled={isPending}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 상태</SelectItem>
            <SelectItem value="OPEN">접수</SelectItem>
            <SelectItem value="IN_PROGRESS">처리중</SelectItem>
            <SelectItem value="CLOSED">완료</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={initialData.data}
        rowKey={(row) => row.ticket_id}
        searchPlaceholder="티켓ID·고객ID 검색"
        onRowClick={openDetail}
        showRowActions={false}
        emptyMessage="CS 티켓이 없습니다."
      />

      {/* 상세 다이얼로그 */}
      <LayerDialog
        open={selectedTicket !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTicket(null);
            form.reset();
          }
        }}
        title="CS 티켓 상세"
        size="lg"
        onConfirm={form.handleSubmit(handleSubmit)}
        confirmLabel="처리 저장"
      >
        <div className="space-y-4 p-4">
          {/* 티켓 기본 정보 */}
          <div className="bg-panel border-separator space-y-2 rounded border p-3 text-sm">
            <div className="flex items-center gap-4">
              <span className="text-text-placeholder w-20">티켓 ID</span>
              <span className="font-medium">{selectedTicket?.ticket_id}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-text-placeholder w-20">유형</span>
              {selectedTicket?.type && (
                <Badge
                  variant="outline"
                  className={`text-xs font-medium ${TICKET_TYPE_CONFIG[selectedTicket.type]?.className ?? ""}`}
                >
                  {TICKET_TYPE_CONFIG[selectedTicket.type]?.label ?? selectedTicket.type}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-text-placeholder w-20">주문 ID</span>
              <span>{selectedTicket?.order_id ?? "-"}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-text-placeholder w-20">접수일시</span>
              <span>{selectedTicket?.created_at?.slice(0, 16).replace("T", " ") ?? "-"}</span>
            </div>
          </div>

          {/* 고객 문의 내용 */}
          <div>
            <p className="mb-2 text-sm font-medium">고객 문의 내용</p>
            <div className="bg-panel border-separator rounded border p-3 text-sm leading-relaxed">
              {selectedTicket?.cs_contents ?? "-"}
            </div>
          </div>

          {/* 처리 결과 폼 */}
          <Form {...form}>
            <form className="space-y-3">
              <FormField
                control={form.control}
                name="cs_action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>처리 결과 *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="처리 결과를 입력하세요" rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>처리 상태</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OPEN">접수</SelectItem>
                        <SelectItem value="IN_PROGRESS">처리중</SelectItem>
                        <SelectItem value="CLOSED">완료</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </LayerDialog>
    </div>
  );
}
