"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { issueCoupon, cancelIssuance } from "@/lib/actions/domain/coupon.actions";
import type { CouponIssuanceRow } from "@/lib/types/domain/promotion";

const ISSUANCE_STATUS: Record<string, { label: string; className: string }> = {
  ISSUED: { label: "발급", className: "bg-primary-light text-primary border-primary/30" },
  USED: { label: "사용", className: "bg-blue-50 text-blue-700 border-blue-200" },
  EXPIRED: { label: "만료", className: "bg-disabled text-text-placeholder border-separator" },
  CANCELLED: { label: "취소", className: "bg-alert-red-bg text-alert-red border-alert-red/30" },
};

const formSchema = z.object({
  customer_id: z.string().optional(),
  expires_at: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

interface IssuanceTabProps {
  couponId: string;
  couponName: string;
  issuances: CouponIssuanceRow[];
  onDataChange: (data: CouponIssuanceRow[]) => void;
}

export function IssuanceTab({ couponId, couponName, issuances, onDataChange }: IssuanceTabProps) {
  const [issueOpen, setIssueOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<CouponIssuanceRow | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { customer_id: "", expires_at: "" },
  });

  const columns: DataTableColumn<CouponIssuanceRow>[] = [
    {
      key: "issuance_id",
      header: "발급ID",
      className: "w-28 truncate text-xs text-muted-foreground",
    },
    {
      key: "customer_id",
      header: "고객ID",
      render: (row) => row.customer_id ?? "(전체)",
    },
    {
      key: "issued_status",
      header: "상태",
      render: (row) => {
        const cfg = ISSUANCE_STATUS[row.issued_status ?? ""] ?? {
          label: row.issued_status ?? "-",
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
      key: "issued_at",
      header: "발급일시",
      render: (row) => row.issued_at?.slice(0, 16).replace("T", " ") ?? "-",
    },
    {
      key: "expires_at",
      header: "만료일",
      render: (row) => row.expires_at?.slice(0, 10) ?? "-",
    },
  ];

  const handleIssue = async (values: FormValues) => {
    const result = await issueCoupon({
      coupon_id: couponId,
      customer_id: values.customer_id || null,
      expires_at: values.expires_at || null,
    });
    if (!result.ok) {
      toast.error(result.error.message ?? "발급 실패");
      return;
    }
    toast.success("쿠폰이 발급되었습니다.");
    onDataChange([result.data as CouponIssuanceRow, ...issuances]);
    setIssueOpen(false);
    form.reset();
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    const result = await cancelIssuance({ issuance_id: cancelTarget.issuance_id });
    if (!result.ok) {
      toast.error(result.error.message ?? "취소 실패");
      setCancelTarget(null);
      return;
    }
    toast.success("발급이 취소되었습니다.");
    onDataChange(
      issuances.map((i) =>
        i.issuance_id === cancelTarget.issuance_id
          ? { ...i, issued_status: "CANCELLED" as const }
          : i
      )
    );
    setCancelTarget(null);
  };

  return (
    <div className="space-y-3">
      <DataTable
        columns={columns}
        data={issuances}
        rowKey={(row) => row.issuance_id}
        searchPlaceholder="발급ID·고객ID 검색"
        showRowActions
        onRowDelete={(row) => setCancelTarget(row)}
        toolbarActions={
          <Button size="sm" onClick={() => setIssueOpen(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            발급
          </Button>
        }
        emptyMessage="발급 이력이 없습니다."
      />

      {/* 발급 다이얼로그 */}
      <LayerDialog
        open={issueOpen}
        onOpenChange={(v) => {
          setIssueOpen(v);
          if (!v) form.reset();
        }}
        title="쿠폰 발급"
        size="sm"
        onConfirm={form.handleSubmit(handleIssue)}
        confirmLabel="발급"
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
            {/* 쿠폰명 (읽기전용) */}
            <FormItem>
              <FormLabel>쿠폰명</FormLabel>
              <Input value={couponName} readOnly className="bg-muted/50" />
            </FormItem>

            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>고객 ID (비워두면 전체 발급)</FormLabel>
                  <FormControl>
                    <Input placeholder="고객 UUID (선택)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expires_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>만료일 (비워두면 쿠폰 만료일 사용)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </LayerDialog>

      {/* 발급 취소 확인 다이얼로그 */}
      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="발급 취소"
        description={`발급ID '${cancelTarget?.issuance_id.slice(0, 8)}...' 를 취소하시겠습니까?`}
        onConfirm={handleCancel}
        destructive
      />
    </div>
  );
}
