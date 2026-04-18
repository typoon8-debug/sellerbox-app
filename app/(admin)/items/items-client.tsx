"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { PriceDisplay } from "@/components/admin/domain/price-display";
import { CategorySelect } from "@/components/admin/domain/category-select";
import { ImageUploader } from "@/components/admin/image-uploader";
import { QueryField } from "@/components/admin/query-field";
import { QueryActions } from "@/components/admin/query-actions";
import { createItem, updateItem, deleteItem } from "@/lib/actions/domain/item.actions";
import { useCategoryOptions } from "@/lib/hooks/use-category-options";
import type { ItemRow } from "@/lib/types/domain/item";
import type { PaginatedResult } from "@/lib/types/api";
import { Plus } from "lucide-react";

// UI 전용 로컬 Zod 스키마 (Server Action 스키마와 역할이 다름)
const itemFormSchema = z.object({
  name: z.string().min(1, "상품명을 입력하세요"),
  category_code_value: z.string().min(1, "카테고리를 선택하세요"),
  list_price: z.number().min(0, "정가를 입력하세요"),
  sale_price: z.number().min(0, "판매가를 입력하세요"),
  status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK", "DISCONTINUED"]),
  item_picture_url: z.string().nullable(),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

const columns: DataTableColumn<ItemRow>[] = [
  { key: "sku", header: "SKU", className: "w-28" },
  { key: "name", header: "상품명" },
  { key: "category_name", header: "카테고리" },
  {
    key: "status",
    header: "상태",
    render: (row) => <DomainBadge type="item" status={row.status ?? ""} />,
  },
  {
    key: "sale_price",
    header: "판매가",
    render: (row) => <PriceDisplay amount={row.sale_price ?? 0} />,
  },
];

interface ItemsClientProps {
  initialData: PaginatedResult<ItemRow>;
  stores: { store_id: string; name: string; tenant_code: string }[];
  initialStoreId: string;
}

export function ItemsClient({ initialData, stores, initialStoreId }: ItemsClientProps) {
  const router = useRouter();
  const [selectedStoreId, setSelectedStoreId] = useState(initialStoreId);
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // 선택된 가게의 tenant.code → common_code 기반 카테고리 동적 조회
  const selectedStore = stores.find((s) => s.store_id === selectedStoreId);
  const { categories, loading: categoriesLoading } = useCategoryOptions(
    selectedStore?.tenant_code ?? null
  );
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ItemRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ItemRow | null>(null);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      category_code_value: "",
      list_price: 0,
      sale_price: 0,
      status: "ACTIVE",
      item_picture_url: null,
    },
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedStoreId) params.set("store_id", selectedStoreId);
    if (categoryFilter && categoryFilter !== "ALL") params.set("category", categoryFilter);
    router.push(`/items?${params.toString()}`);
  };

  const handleReset = () => {
    const firstStoreId = stores[0]?.store_id ?? "";
    setSelectedStoreId(firstStoreId);
    setCategoryFilter("ALL");
    router.push(`/items${firstStoreId ? `?store_id=${firstStoreId}` : ""}`);
  };

  const openRegister = () => {
    form.reset({
      name: "",
      category_code_value: "",
      list_price: 0,
      sale_price: 0,
      status: "ACTIVE",
      item_picture_url: null,
    });
    setRegisterOpen(true);
  };

  const openEdit = (row: ItemRow) => {
    form.reset({
      name: row.name ?? "",
      category_code_value: row.category_code_value ?? "",
      list_price: row.list_price ?? 0,
      sale_price: row.sale_price ?? 0,
      status: row.status ?? "ACTIVE",
      item_picture_url: row.item_picture_url ?? null,
    });
    setEditTarget(row);
  };

  const handleSubmit = async (values: ItemFormValues) => {
    if (editTarget) {
      const result = await updateItem({
        item_id: editTarget.item_id,
        name: values.name,
        category_code_value: values.category_code_value,
        list_price: values.list_price,
        sale_price: values.sale_price,
        status: values.status,
        item_picture_url: values.item_picture_url,
      });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("상품 정보가 수정되었습니다.");
      setEditTarget(null);
    } else {
      const result = await createItem({
        store_id: selectedStoreId,
        sku: `SKU-${Date.now()}`,
        category_code_value: values.category_code_value,
        category_name:
          categories.find((c) => c.value === values.category_code_value)?.label ??
          values.category_code_value,
        name: values.name,
        list_price: values.list_price,
        sale_price: values.sale_price,
        item_picture_url: values.item_picture_url,
        status: values.status,
      });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("상품이 등록되었습니다.");
      setRegisterOpen(false);
    }
    form.reset();
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteItem({ item_id: deleteTarget.item_id });
    if (!result.ok) {
      toast.error(result.error.message);
      setDeleteTarget(null);
      return;
    }
    toast.success(`'${deleteTarget.name}' 상품이 삭제되었습니다.`);
    setDeleteTarget(null);
    router.refresh();
  };

  const isDialogOpen = registerOpen || editTarget !== null;

  return (
    <div>
      {/* 검색조건 영역 */}
      <div className="border-separator border-b p-4">
        <div className="flex flex-wrap items-end gap-3">
          <QueryField label="가게명" required>
            <Select
              value={selectedStoreId}
              onValueChange={(value) => {
                setSelectedStoreId(value);
                setCategoryFilter("ALL");
              }}
              disabled={stores.length === 0}
            >
              <SelectTrigger className="w-52">
                <SelectValue placeholder={stores.length === 0 ? "소속 가게 없음" : "가게 선택"} />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.store_id} value={store.store_id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </QueryField>
          <QueryField label="카테고리">
            <CategorySelect
              value={categoryFilter}
              onValueChange={setCategoryFilter}
              categories={categories}
              placeholder="전체"
              disabled={categoriesLoading}
            />
          </QueryField>
          <QueryActions onSearch={handleSearch} onReset={handleReset} />
        </div>
      </div>

      {/* 상품 목록 */}
      <div className="p-6">
        {stores.length === 0 && (
          <div className="text-text-placeholder border-separator bg-panel mb-4 rounded border p-8 text-center text-sm">
            소속된 가게가 없습니다. 관리자에게 가게 배정을 요청하세요.
          </div>
        )}
        <DataTable
          columns={columns}
          data={initialData.data}
          rowKey={(row) => row.item_id}
          searchPlaceholder="상품명·SKU 검색"
          toolbarActions={
            <Button size="sm" onClick={openRegister}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              상품 등록
            </Button>
          }
          onRowEdit={openEdit}
          onRowDelete={(row) => setDeleteTarget(row)}
        />
      </div>

      {/* 등록/수정 다이얼로그 */}
      <LayerDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRegisterOpen(false);
            setEditTarget(null);
          }
        }}
        title={editTarget ? "상품 수정" : "상품 등록"}
        size="md"
        onConfirm={form.handleSubmit(handleSubmit)}
        confirmLabel={editTarget ? "수정" : "등록"}
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="item_picture_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상품 이미지</FormLabel>
                  <FormControl>
                    <ImageUploader
                      value={field.value}
                      onChange={(url) => field.onChange(url)}
                      expectedWidth={400}
                      expectedHeight={400}
                      autoResize
                      sizeHint="권장: 400×400px"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상품명 *</FormLabel>
                  <FormControl>
                    <Input placeholder="상품명을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category_code_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카테고리 *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={categoriesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={categoriesLoading ? "불러오는 중..." : "카테고리 선택"}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.length === 0 ? (
                        <div className="text-muted-foreground py-2 text-center text-sm">
                          카테고리가 설정되지 않았습니다
                        </div>
                      ) : (
                        categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="list_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>정가</FormLabel>
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
              <FormField
                control={form.control}
                name="sale_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>판매가 *</FormLabel>
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
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상태</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="상태 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">판매중</SelectItem>
                      <SelectItem value="INACTIVE">비활성</SelectItem>
                      <SelectItem value="OUT_OF_STOCK">품절</SelectItem>
                      <SelectItem value="DISCONTINUED">단종</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </LayerDialog>

      {/* 삭제 확인 */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="상품 삭제"
        description={`'${deleteTarget?.name}' 상품을 삭제하시겠습니까?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
