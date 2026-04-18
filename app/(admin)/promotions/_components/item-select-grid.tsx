"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
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
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { LayerDialog } from "@/components/admin/layer-dialog";
import { addPromotionItem } from "@/lib/actions/domain/promotion.actions";
import type { ItemRow } from "@/lib/types/domain/item";
import type { PromotionItemRow } from "@/lib/types/domain/promotion";

// ─── 상품 추가 폼 스키마 ────────────────────────────────────────────────────

const addFormSchema = z.object({
  condition_qty: z.number().int().min(1).optional().nullable(),
  reward_qty: z.number().int().min(1).optional().nullable(),
  reward_item_id: z.string().optional().nullable(),
  limit_per_order: z.number().int().min(1).optional().nullable(),
});

type AddFormValues = z.infer<typeof addFormSchema>;

// ─── 컬럼 정의 ────────────────────────────────────────────────────────────────

const itemColumns: DataTableColumn<ItemRow>[] = [
  {
    key: "sku",
    header: "SKU",
    className: "w-28 text-xs text-muted-foreground",
  },
  { key: "name", header: "상품명" },
  {
    key: "category_name",
    header: "카테고리",
    render: (row) => row.category_name ?? "-",
  },
  {
    key: "sale_price",
    header: "판매가",
    render: (row) => `${(row.sale_price ?? 0).toLocaleString()}원`,
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface ItemSelectGridProps {
  promoId: string;
  storeId: string;
  items: ItemRow[];
  registeredItemIds: Set<string>;
  onAdded: (newItem: PromotionItemRow) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ItemSelectGrid({
  promoId,
  items,
  registeredItemIds,
  onAdded,
}: ItemSelectGridProps) {
  // 체크박스 다중선택
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);

  const form = useForm<AddFormValues>({
    resolver: zodResolver(addFormSchema),
    defaultValues: {
      condition_qty: null,
      reward_qty: null,
      reward_item_id: null,
      limit_per_order: null,
    },
  });

  const handleOpenAdd = () => {
    if (selectedKeys.size === 0) {
      toast.warning("추가할 상품을 선택하세요.");
      return;
    }
    form.reset({
      condition_qty: null,
      reward_qty: null,
      reward_item_id: null,
      limit_per_order: null,
    });
    setAddOpen(true);
  };

  const handleSubmitAdd = async (values: AddFormValues) => {
    const itemIds = [...selectedKeys];
    let lastAdded: PromotionItemRow | null = null;

    for (const item_id of itemIds) {
      const result = await addPromotionItem({
        promo_id: promoId,
        item_id,
        condition_qty: values.condition_qty,
        reward_qty: values.reward_qty,
        reward_item_id: values.reward_item_id || undefined,
        limit_per_order: values.limit_per_order,
        status: "ACTIVE",
      });
      if (!result.ok) {
        toast.error(`상품 추가 실패: ${result.error.message}`);
        return;
      }
      lastAdded = result.data as PromotionItemRow;
      onAdded(result.data as PromotionItemRow);
    }

    if (lastAdded) {
      toast.success(`${itemIds.length}개 상품이 프로모션에 추가되었습니다.`);
    }
    setSelectedKeys(new Set());
    setAddOpen(false);
  };

  // 이미 등록된 상품은 비활성화 표시
  const displayItems = items.map((item) => ({
    ...item,
    _disabled: registeredItemIds.has(item.item_id),
  }));

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-foreground text-sm font-medium">가게 상품 목록</p>
        <Button
          size="sm"
          variant="outline"
          onClick={handleOpenAdd}
          disabled={selectedKeys.size === 0}
        >
          <ArrowRight className="mr-1 h-3.5 w-3.5" />
          추가 ({selectedKeys.size})
        </Button>
      </div>

      <DataTable
        columns={itemColumns}
        data={displayItems}
        rowKey={(row) => row.item_id}
        selectable
        selectedKeys={selectedKeys}
        onSelectionChange={(keys) => {
          // 이미 등록된 상품은 선택 불가
          const filtered = new Set([...keys].filter((k) => !registeredItemIds.has(k)));
          setSelectedKeys(filtered);
        }}
        searchPlaceholder="SKU·상품명 검색"
        emptyMessage="가게에 등록된 상품이 없습니다."
        rowClassName={(row) =>
          registeredItemIds.has(row.item_id) ? "opacity-40 pointer-events-none" : ""
        }
      />

      {/* 상품 추가 수량 설정 다이얼로그 */}
      <LayerDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="프로모션 상품 추가"
        size="sm"
        onConfirm={form.handleSubmit(handleSubmitAdd)}
        confirmLabel="추가"
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
            <p className="text-muted-foreground text-sm">
              선택된 {selectedKeys.size}개 상품에 동일 조건을 적용합니다.
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
                  <FormLabel>주문당 적용 한도</FormLabel>
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
    </div>
  );
}
