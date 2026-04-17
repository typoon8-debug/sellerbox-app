"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
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
  updatePromotionItem,
  softDeletePromotionItem,
} from "@/lib/actions/domain/promotion.actions";
import type { ItemRow } from "@/lib/types/domain/item";
import type { PromotionItemRow } from "@/lib/types/domain/promotion";

// ─── 수정 폼 스키마 ────────────────────────────────────────────────────────────

const editFormSchema = z.object({
  condition_qty: z.number().int().min(1).optional().nullable(),
  reward_qty: z.number().int().min(1).optional().nullable(),
  limit_per_order: z.number().int().min(1).optional().nullable(),
});

type EditFormValues = z.infer<typeof editFormSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface PromotionItemListGridProps {
  promotionItems: PromotionItemRow[];
  storeItems: ItemRow[];
  onUpdate: (updated: PromotionItemRow) => void;
  onDelete: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PromotionItemListGrid({
  promotionItems,
  storeItems,
  onUpdate,
  onDelete,
}: PromotionItemListGridProps) {
  const [editTarget, setEditTarget] = useState<PromotionItemRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PromotionItemRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // item_id → 상품명 맵
  const itemNameMap = new Map(storeItems.map((item) => [item.item_id, item.name]));

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      condition_qty: null,
      reward_qty: null,
      limit_per_order: null,
    },
  });

  const handleOpenEdit = (row: PromotionItemRow) => {
    setEditTarget(row);
    form.reset({
      condition_qty: row.condition_qty ?? null,
      reward_qty: row.reward_qty ?? null,
      limit_per_order: row.limit_per_order ?? null,
    });
  };

  const handleSubmitEdit = async (values: EditFormValues) => {
    if (!editTarget) return;
    const result = await updatePromotionItem({
      id: editTarget.id,
      condition_qty: values.condition_qty,
      reward_qty: values.reward_qty,
      limit_per_order: values.limit_per_order,
    });
    if (!result.ok) {
      toast.error(result.error.message ?? "수정 실패");
      return;
    }
    toast.success("수정되었습니다.");
    onUpdate(result.data as PromotionItemRow);
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await softDeletePromotionItem({ id: deleteTarget.id });
    setIsDeleting(false);
    if (!result.ok) {
      toast.error(result.error.message ?? "삭제 실패");
      setDeleteTarget(null);
      return;
    }
    toast.success("프로모션 상품이 제거되었습니다.");
    onDelete(deleteTarget.id);
    setDeleteTarget(null);
  };

  // 컬럼 정의
  const columns: DataTableColumn<PromotionItemRow>[] = [
    {
      key: "item_id",
      header: "상품명",
      render: (row) => itemNameMap.get(row.item_id) ?? row.item_id,
    },
    {
      key: "condition_qty",
      header: "조건 수량",
      render: (row) => row.condition_qty?.toString() ?? "-",
    },
    {
      key: "reward_qty",
      header: "보상 수량",
      render: (row) => row.reward_qty?.toString() ?? "-",
    },
    {
      key: "limit_per_order",
      header: "주문 한도",
      render: (row) => row.limit_per_order?.toString() ?? "-",
    },
  ];

  return (
    <div className="flex h-full flex-col gap-3">
      <p className="text-foreground text-sm font-medium">등록된 상품</p>

      <DataTable
        columns={columns}
        data={promotionItems}
        rowKey={(row) => row.id}
        showRowActions
        onRowEdit={handleOpenEdit}
        onRowDelete={(row) => setDeleteTarget(row)}
        emptyMessage="프로모션에 등록된 상품이 없습니다."
      />

      {/* 수정 다이얼로그 */}
      <LayerDialog
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title="프로모션 상품 수정"
        size="sm"
        onConfirm={form.handleSubmit(handleSubmitEdit)}
        confirmLabel="저장"
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
            <p className="text-muted-foreground text-sm">
              {editTarget ? (itemNameMap.get(editTarget.item_id) ?? editTarget.item_id) : ""}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="condition_qty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>조건 수량</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="없음"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reward_qty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>보상 수량</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="없음"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="limit_per_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>주문당 한도</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="없음"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </LayerDialog>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="프로모션 상품 제거"
        description={`'${deleteTarget ? (itemNameMap.get(deleteTarget.item_id) ?? deleteTarget.item_id) : ""}' 상품을 이 프로모션에서 제거하시겠습니까?`}
        confirmLabel={isDeleting ? "처리 중..." : "제거"}
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
