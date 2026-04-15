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
import { MOCK_INVENTORIES, type InventoryWithItem } from "@/lib/mocks/inventory";
import { Settings2 } from "lucide-react";

// 더미 트랜잭션 이력 데이터
const MOCK_TXN_HISTORY = [
  {
    id: "txn-001",
    type: "INBOUND",
    qty: 100,
    before: 50,
    after: 150,
    created_at: "2024-04-10T08:00:00Z",
  },
  {
    id: "txn-002",
    type: "OUTBOUND",
    qty: -5,
    before: 150,
    after: 145,
    created_at: "2024-04-11T09:00:00Z",
  },
  {
    id: "txn-003",
    type: "ADJUST",
    qty: 5,
    before: 145,
    after: 150,
    created_at: "2024-04-12T10:00:00Z",
  },
  {
    id: "txn-004",
    type: "RETURN",
    qty: 2,
    before: 148,
    after: 150,
    created_at: "2024-04-13T11:00:00Z",
  },
];

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
  { key: "on_hand", header: "재고", render: (row) => `${row.on_hand}개` },
  { key: "reserved", header: "예약", render: (row) => `${row.reserved}개` },
  { key: "safety_stock", header: "안전재고", render: (row) => `${row.safety_stock}개` },
];

export function InventoryClient() {
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<InventoryWithItem | null>(null);

  const form = useForm<AdjustFormValues>({
    resolver: zodResolver(adjustFormSchema),
    defaultValues: { txn_type: "INBOUND", quantity: 1, memo: "" },
  });

  const filteredData =
    categoryFilter === "ALL"
      ? MOCK_INVENTORIES
      : MOCK_INVENTORIES.filter((inv) => {
          const cat = ITEM_CATEGORIES.find((c) => c.label === inv.category_name);
          return cat?.value === categoryFilter;
        });

  const handleAdjust = (values: AdjustFormValues) => {
    console.log("재고 조정:", values);
    toast.success("재고가 조정되었습니다.");
    setAdjustOpen(false);
    form.reset();
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
          <Button size="sm" variant="outline-gray" onClick={() => setAdjustOpen(true)}>
            <Settings2 className="mr-1 h-3.5 w-3.5" />
            재고 조정
          </Button>
        }
        onRowClick={(row) => setHistoryTarget(row)}
        showRowActions={false}
      />

      {/* 재고 조정 다이얼로그 */}
      <LayerDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        title="재고 조정"
        size="sm"
        onConfirm={form.handleSubmit(handleAdjust)}
        confirmLabel="조정"
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
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
                  {MOCK_TXN_HISTORY.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="text-xs font-medium">{txn.type}</TableCell>
                      <TableCell className="text-center text-sm">
                        <span className={txn.qty > 0 ? "text-primary" : "text-alert-red"}>
                          {txn.qty > 0 ? `+${txn.qty}` : txn.qty}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-sm">{txn.before}</TableCell>
                      <TableCell className="text-center text-sm">{txn.after}</TableCell>
                      <TableCell className="text-xs">{txn.created_at.slice(0, 10)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
