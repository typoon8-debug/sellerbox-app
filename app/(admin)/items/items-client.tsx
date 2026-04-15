"use client";

import { useState, useRef } from "react";
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
import { CategorySelect, ITEM_CATEGORIES } from "@/components/admin/domain/category-select";
import { ImageUploader } from "@/components/admin/image-uploader";
import { createItem, updateItem, deleteItem } from "@/lib/actions/domain/item.actions";
import { uploadImage } from "@/lib/supabase/storage";
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
}

export function ItemsClient({ initialData }: ItemsClientProps) {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ItemRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ItemRow | null>(null);
  // 업로드할 파일 객체를 ref로 관리 (form 값은 URL 문자열)
  const pendingFileRef = useRef<File | null>(null);

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

  // 카테고리 필터는 클라이언트 측에서 적용 (서버 데이터는 이미 paginate로 조회됨)
  const filteredItems =
    categoryFilter === "ALL"
      ? initialData.data
      : initialData.data.filter((item) => item.category_code_value === categoryFilter);

  const openRegister = () => {
    pendingFileRef.current = null;
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
    pendingFileRef.current = null;
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

  /**
   * ImageUploader의 onChange는 dataUrl 문자열을 반환
   * 실제 파일 업로드는 submit 시점에 pendingFileRef를 통해 처리
   */
  const handleImageChange = (dataUrl: string | null) => {
    form.setValue("item_picture_url", dataUrl);
    // dataUrl이 있으면 File 객체로 변환하여 ref에 저장
    if (dataUrl && dataUrl.startsWith("data:")) {
      // base64 dataUrl → File 변환
      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const ext = blob.type.split("/")[1] ?? "jpg";
          const file = new File([blob], `image.${ext}`, { type: blob.type });
          pendingFileRef.current = file;
        })
        .catch(() => {
          pendingFileRef.current = null;
        });
    } else {
      pendingFileRef.current = null;
    }
  };

  const handleSubmit = async (values: ItemFormValues) => {
    let imageUrl: string | null = values.item_picture_url;

    // dataUrl 형태인 경우 Storage 업로드
    if (pendingFileRef.current) {
      try {
        imageUrl = await uploadImage("item-images", pendingFileRef.current);
      } catch (err) {
        toast.error("이미지 업로드 중 오류가 발생했습니다.");
        console.error(err);
        return;
      }
    } else if (imageUrl?.startsWith("data:")) {
      // dataUrl이지만 File 변환 전이면 업로드 불가 — 경고
      toast.error("이미지 처리 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (editTarget) {
      // 상품 수정
      const result = await updateItem({
        item_id: editTarget.item_id,
        name: values.name,
        category_code_value: values.category_code_value,
        list_price: values.list_price,
        sale_price: values.sale_price,
        status: values.status,
        item_picture_url: imageUrl,
      });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("상품 정보가 수정되었습니다.");
      setEditTarget(null);
    } else {
      // 상품 등록
      const result = await createItem({
        store_id: "00000000-0000-0000-0000-000000000000",
        sku: `SKU-${Date.now()}`,
        category_code_value: values.category_code_value,
        category_name:
          ITEM_CATEGORIES.find((c) => c.value === values.category_code_value)?.label ??
          values.category_code_value,
        name: values.name,
        list_price: values.list_price,
        sale_price: values.sale_price,
        item_picture_url: imageUrl,
        status: values.status,
      });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("상품이 등록되었습니다.");
      setRegisterOpen(false);
    }
    pendingFileRef.current = null;
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
        data={filteredItems}
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

      {/* 등록/수정 다이얼로그 */}
      <LayerDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRegisterOpen(false);
            setEditTarget(null);
            pendingFileRef.current = null;
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
                      onChange={handleImageChange}
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ITEM_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
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
