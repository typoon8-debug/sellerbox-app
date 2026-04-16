"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { LayerDialog } from "@/components/admin/layer-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import {
  createStoreFulfillment,
  updateStoreFulfillment,
  deleteStoreFulfillment,
} from "@/lib/actions/domain/store-fulfillment.actions";
import type { StoreFulfillmentRow } from "@/lib/types/domain/store";

const FULFILLMENT_TYPES = [
  "DELIVERY",
  "PICKUP",
  "BBQ",
  "RESERVE",
  "FRESH_MORNING",
  "SAME_DAY",
  "3P_DELIVERY",
  "NONE",
] as const;

const fulfillmentFormSchema = z.object({
  fulfillment_type: z.enum(FULFILLMENT_TYPES),
  active: z.boolean(),
});

type FulfillmentFormValues = z.infer<typeof fulfillmentFormSchema>;

interface FulfillmentTabProps {
  storeId: string;
  fulfillments: StoreFulfillmentRow[];
  onDataChange: (data: StoreFulfillmentRow[]) => void;
}

export function FulfillmentTab({ storeId, fulfillments, onDataChange }: FulfillmentTabProps) {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StoreFulfillmentRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StoreFulfillmentRow | null>(null);

  const form = useForm<FulfillmentFormValues>({
    resolver: zodResolver(fulfillmentFormSchema),
    defaultValues: { fulfillment_type: "DELIVERY", active: true },
  });

  const columns: DataTableColumn<StoreFulfillmentRow>[] = [
    { key: "fulfillment_type", header: "풀필먼트 유형" },
    {
      key: "active",
      header: "활성 여부",
      render: (row) => (
        <Badge
          variant="outline"
          className={
            row.active ? "border-primary/30 bg-primary-light text-primary" : "text-text-placeholder"
          }
        >
          {row.active ? "활성" : "비활성"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "등록일",
      render: (row) => row.created_at?.slice(0, 10) ?? "-",
    },
  ];

  const openRegister = () => {
    form.reset({ fulfillment_type: "DELIVERY", active: true });
    setRegisterOpen(true);
  };

  const openEdit = (row: StoreFulfillmentRow) => {
    form.reset({
      fulfillment_type: row.fulfillment_type as (typeof FULFILLMENT_TYPES)[number],
      active: row.active ?? true,
    });
    setEditTarget(row);
  };

  const handleSubmit = async (values: FulfillmentFormValues) => {
    if (editTarget) {
      const result = await updateStoreFulfillment({ id: editTarget.id, ...values });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("배송정보가 수정되었습니다.");
      onDataChange(
        fulfillments.map((f) => (f.id === editTarget.id ? (result.data as StoreFulfillmentRow) : f))
      );
      setEditTarget(null);
    } else {
      const result = await createStoreFulfillment({ store_id: storeId, ...values });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("배송정보가 추가되었습니다.");
      onDataChange([...fulfillments, result.data as StoreFulfillmentRow]);
      setRegisterOpen(false);
    }
    form.reset();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteStoreFulfillment({ id: deleteTarget.id });
    if (!result.ok) {
      toast.error(result.error.message);
      setDeleteTarget(null);
      return;
    }
    toast.success("배송정보가 삭제되었습니다.");
    onDataChange(fulfillments.filter((f) => f.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const isDialogOpen = registerOpen || editTarget !== null;

  return (
    <div>
      <DataTable
        columns={columns}
        data={fulfillments}
        rowKey={(row) => row.id}
        toolbarActions={
          <Button size="sm" variant="outline-gray" onClick={openRegister}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            추가
          </Button>
        }
        showRowActions
        onRowEdit={openEdit}
        onRowDelete={(row) => setDeleteTarget(row)}
        emptyMessage="배송정보가 없습니다."
      />

      <LayerDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRegisterOpen(false);
            setEditTarget(null);
          }
        }}
        title={editTarget ? "배송정보 수정" : "배송정보 추가"}
        onConfirm={form.handleSubmit(handleSubmit)}
        confirmLabel={editTarget ? "수정" : "추가"}
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="fulfillment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>풀필먼트 유형 *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FULFILLMENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
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
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormLabel>활성 여부</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </LayerDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="배송정보 삭제"
        description={`'${deleteTarget?.fulfillment_type}' 배송정보를 삭제하시겠습니까?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
