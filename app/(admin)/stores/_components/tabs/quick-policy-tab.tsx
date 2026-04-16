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
  createQuickPolicy,
  updateQuickPolicy,
  deleteQuickPolicy,
} from "@/lib/actions/domain/store-quick-policy.actions";
import type { Database } from "@/lib/supabase/database.types";

type StoreQuickPolicyRow = Database["public"]["Tables"]["store_quick_policy"]["Row"];

const policyFormSchema = z.object({
  min_order_amount: z.number().int().min(0),
  daily_runs: z.number().int().min(1),
  capacity_per_slot: z.number().int().min(1),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

function numOnChange(fieldOnChange: (v: number) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    fieldOnChange(e.target.valueAsNumber);
  };
}

type PolicyFormValues = z.infer<typeof policyFormSchema>;

interface QuickPolicyTabProps {
  storeId: string;
  quickPolicies: StoreQuickPolicyRow[];
  onDataChange: (data: StoreQuickPolicyRow[]) => void;
}

export function QuickPolicyTab({ storeId, quickPolicies, onDataChange }: QuickPolicyTabProps) {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StoreQuickPolicyRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StoreQuickPolicyRow | null>(null);

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: { min_order_amount: 0, daily_runs: 1, capacity_per_slot: 10, status: "ACTIVE" },
  });

  const columns: DataTableColumn<StoreQuickPolicyRow>[] = [
    {
      key: "min_order_amount",
      header: "최소 주문 금액",
      render: (row) => `${row.min_order_amount.toLocaleString()}원`,
    },
    { key: "daily_runs", header: "일일 운행 횟수", render: (row) => `${row.daily_runs}회` },
    {
      key: "capacity_per_slot",
      header: "슬롯당 용량",
      render: (row) => `${row.capacity_per_slot}건`,
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
    form.reset({ min_order_amount: 0, daily_runs: 1, capacity_per_slot: 10, status: "ACTIVE" });
    setRegisterOpen(true);
  };

  const openEdit = (row: StoreQuickPolicyRow) => {
    form.reset({
      min_order_amount: row.min_order_amount,
      daily_runs: row.daily_runs,
      capacity_per_slot: row.capacity_per_slot,
      status: (row.status as "ACTIVE" | "INACTIVE") ?? "ACTIVE",
    });
    setEditTarget(row);
  };

  const handleSubmit = async (values: PolicyFormValues) => {
    if (editTarget) {
      const result = await updateQuickPolicy({ policy_id: editTarget.policy_id, ...values });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("바로퀵 정책이 수정되었습니다.");
      onDataChange(
        quickPolicies.map((p) =>
          p.policy_id === editTarget.policy_id ? (result.data as StoreQuickPolicyRow) : p
        )
      );
      setEditTarget(null);
    } else {
      const result = await createQuickPolicy({ store_id: storeId, ...values });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("바로퀵 정책이 추가되었습니다.");
      onDataChange([...quickPolicies, result.data as StoreQuickPolicyRow]);
      setRegisterOpen(false);
    }
    form.reset();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteQuickPolicy({ policy_id: deleteTarget.policy_id });
    if (!result.ok) {
      toast.error(result.error.message);
      setDeleteTarget(null);
      return;
    }
    toast.success("바로퀵 정책이 삭제되었습니다.");
    onDataChange(quickPolicies.filter((p) => p.policy_id !== deleteTarget.policy_id));
    setDeleteTarget(null);
  };

  const isDialogOpen = registerOpen || editTarget !== null;

  return (
    <div>
      <DataTable
        columns={columns}
        data={quickPolicies}
        rowKey={(row) => row.policy_id}
        toolbarActions={
          <Button size="sm" variant="outline-gray" onClick={openRegister}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            추가
          </Button>
        }
        showRowActions
        onRowEdit={openEdit}
        onRowDelete={(row) => setDeleteTarget(row)}
        emptyMessage="바로퀵 정책이 없습니다."
      />

      <LayerDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRegisterOpen(false);
            setEditTarget(null);
          }
        }}
        title={editTarget ? "바로퀵 정책 수정" : "바로퀵 정책 추가"}
        onConfirm={form.handleSubmit(handleSubmit)}
        confirmLabel={editTarget ? "수정" : "추가"}
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="min_order_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>최소 주문 금액 *</FormLabel>
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
            <FormField
              control={form.control}
              name="daily_runs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>일일 운행 횟수 *</FormLabel>
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
            <FormField
              control={form.control}
              name="capacity_per_slot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>슬롯당 용량 *</FormLabel>
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
        title="바로퀵 정책 삭제"
        description="이 바로퀵 정책을 삭제하시겠습니까?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
