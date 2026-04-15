"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { LayerDialog } from "@/components/admin/layer-dialog";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { CategorySelect, ITEM_CATEGORIES } from "@/components/admin/domain/category-select";
import { Settings2 } from "lucide-react";
import { adjustInventory } from "@/lib/actions/domain/inventory.actions";
import { getInventoryTxnList } from "@/lib/actions/domain/inventory.actions";
import type { Database } from "@/lib/supabase/database.types";

// 재고 + 상품 조인 타입
type InventoryRow = Database["public"]["Tables"]["inventory"]["Row"];
type ItemRow = Database["public"]["Tables"]["item"]["Row"];

export type InventoryWithItem = InventoryRow & {
  item: ItemRow | null;
  // 편의 필드 (item에서 추출)
  item_name: string;
  item_sku: string;
  category_name: string;
};

// 트랜잭션 이력 Row 타입
type InventoryTxnRow = Database["public"]["Tables"]["inventory_txn"]["Row"];

/** 서버에서 받은 raw join 데이터를 InventoryWithItem 형태로 변환 */
function normalizeInventory(raw: InventoryRow & { item: ItemRow | null }): InventoryWithItem {
  return {
    ...raw,
    item: raw.item,
    item_name: raw.item?.name ?? "-",
    item_sku: raw.item?.sku ?? "-",
    category_name: raw.item?.category_name ?? "-",
  };
}

const adjustFormSchema = z.object({
  txn_type: z.enum(["INBOUND", "ADJUST", "RETURN"]),
  quantity: z.number().min(1, "수량을 입력하세요"),
  memo: z.string().optional(),
});

type AdjustFormValues = z.infer<typeof adjustFormSchema>;

const columns: DataTableColumn<InventoryWithItem>[] = [
  { key: "item_sku", header: "SKU", className: "w-28" },
  { key: "item_name", header: "상품명" },
  { key: "category_name", header: "카테고리" },
  {
    key: "status",
    header: "상태",
    render: (row) => <DomainBadge type="inventory" status={row.status ?? ""} />,
  },
  {
    key: "on_hand",
    header: "재고",
    render: (row) => (
      <span className={row.on_hand < row.safety_stock ? "text-alert-red font-semibold" : ""}>
        {row.on_hand}개
      </span>
    ),
  },
  { key: "reserved", header: "예약", render: (row) => `${row.reserved}개` },
  { key: "safety_stock", header: "안전재고", render: (row) => `${row.safety_stock}개` },
];

interface InventoryClientProps {
  initialData: (InventoryRow & { item: ItemRow | null })[];
}

export function InventoryClient({ initialData }: InventoryClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // raw 데이터를 정규화
  const inventories: InventoryWithItem[] = initialData.map(normalizeInventory);

  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [adjustTarget, setAdjustTarget] = useState<InventoryWithItem | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<InventoryWithItem | null>(null);
  const [txnHistory, setTxnHistory] = useState<InventoryTxnRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const form = useForm<AdjustFormValues>({
    resolver: zodResolver(adjustFormSchema),
    defaultValues: { txn_type: "INBOUND", quantity: 1, memo: "" },
  });

  const filteredData =
    categoryFilter === "ALL"
      ? inventories
      : inventories.filter((inv) => {
          const cat = ITEM_CATEGORIES.find((c) => c.label === inv.category_name);
          return cat?.value === categoryFilter;
        });

  // 재고 조정 다이얼로그 열기
  const handleOpenAdjust = (row?: InventoryWithItem) => {
    setAdjustTarget(row ?? null);
    setAdjustOpen(true);
  };

  // 재고 조정 제출
  const handleAdjust = (values: AdjustFormValues) => {
    if (!adjustTarget) {
      toast.error("조정할 재고를 선택해 주세요.");
      return;
    }

    startTransition(async () => {
      const result = await adjustInventory({
        inventory_id: adjustTarget.inventory_id,
        type: values.txn_type === "RETURN" ? "ADJUST" : values.txn_type,
        quantity: values.quantity,
        reason: values.memo,
      });

      if (result.ok) {
        toast.success("재고가 조정되었습니다.");
        setAdjustOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast.error(result.error?.message ?? "재고 조정에 실패했습니다.");
      }
    });
  };

  // 트랜잭션 이력 Sheet 열기
  const handleRowClick = async (row: InventoryWithItem) => {
    setHistoryTarget(row);
    setHistoryLoading(true);
    setTxnHistory([]);

    const result = await getInventoryTxnList({ inventory_id: row.inventory_id });
    if (result.ok && result.data) {
      setTxnHistory(result.data);
    } else {
      toast.error("트랜잭션 이력을 불러오지 못했습니다.");
    }
    setHistoryLoading(false);
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <CategorySelect
          value={categoryFilter}
          onValueChange={setCategoryFilter}
          categories={ITEM_CATEGORIES}
          placeholder="카테고리 필터"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        rowKey={(row) => row.inventory_id}
        searchPlaceholder="상품명·SKU 검색"
        toolbarActions={
          <Button size="sm" variant="outline-gray" onClick={() => handleOpenAdjust()}>
            <Settings2 className="mr-1 h-3.5 w-3.5" />
            재고 조정
          </Button>
        }
        onRowClick={handleRowClick}
        showRowActions={false}
        rowClassName={(row) => (row.on_hand < row.safety_stock ? "bg-red-50 hover:bg-red-100" : "")}
      />

      {/* 재고 조정 다이얼로그 */}
      <LayerDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        title="재고 조정"
        size="sm"
        onConfirm={form.handleSubmit(handleAdjust)}
        confirmLabel={isPending ? "처리 중..." : "조정"}
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
            {/* 선택된 상품 표시 */}
            {adjustTarget && (
              <div className="bg-panel rounded px-3 py-2 text-sm">
                <span className="text-muted-foreground">대상: </span>
                <span className="font-medium">{adjustTarget.item_name}</span>
                <span className="text-muted-foreground ml-2">({adjustTarget.item_sku})</span>
              </div>
            )}
            {!adjustTarget && (
              <div className="flex items-center gap-2 rounded border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
                <AlertTriangle className="h-4 w-4" />
                <span>목록에서 행을 선택 후 조정하거나, 재고 조정 버튼을 클릭하세요.</span>
              </div>
            )}
            <FormField
              control={form.control}
              name="txn_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>조정 유형</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INBOUND">입고 (INBOUND)</SelectItem>
                      <SelectItem value="ADJUST">조정 (ADJUST)</SelectItem>
                      <SelectItem value="RETURN">반품 (RETURN)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>수량 *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="수량 입력"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>메모</FormLabel>
                  <FormControl>
                    <Input placeholder="조정 사유" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </LayerDialog>

      {/* 트랜잭션 이력 Sheet */}
      <Sheet open={historyTarget !== null} onOpenChange={(open) => !open && setHistoryTarget(null)}>
        <SheetContent className="w-[480px] sm:max-w-[480px]">
          <SheetHeader>
            <SheetTitle>트랜잭션 이력</SheetTitle>
            <SheetDescription>{historyTarget?.item_name}</SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            {historyLoading ? (
              <p className="text-muted-foreground py-8 text-center text-sm">불러오는 중...</p>
            ) : txnHistory.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">이력이 없습니다.</p>
            ) : (
              <div className="border-separator rounded border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-panel">
                      <TableHead>유형</TableHead>
                      <TableHead className="text-center">수량</TableHead>
                      <TableHead className="text-center">변경 전</TableHead>
                      <TableHead className="text-center">변경 후</TableHead>
                      <TableHead>일시</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {txnHistory.map((txn) => (
                      <TableRow key={txn.txnId}>
                        <TableCell className="text-xs font-medium">{txn.type}</TableCell>
                        <TableCell className="text-center text-sm">
                          <span className={txn.quantity > 0 ? "text-primary" : "text-alert-red"}>
                            {txn.quantity > 0 ? `+${txn.quantity}` : txn.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-sm">{txn.before_quantity}</TableCell>
                        <TableCell className="text-center text-sm">{txn.after_quantity}</TableCell>
                        <TableCell className="text-xs">{txn.created_at.slice(0, 10)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
