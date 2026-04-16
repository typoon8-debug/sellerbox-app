"use client";

import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { PriceDisplay } from "@/components/admin/domain/price-display";
import { CategorySelect, ITEM_CATEGORIES } from "@/components/admin/domain/category-select";
import { ImageUploader } from "@/components/admin/image-uploader";
import { QueryField } from "@/components/admin/query-field";
import { QueryActions } from "@/components/admin/query-actions";
import {
  fetchItemsByStore,
  fetchItemDetailByItem,
  createItemDetail,
  updateItemDetail,
  softDeleteItemDetail,
} from "@/lib/actions/domain/item-detail.actions";
import { uploadImageAction } from "@/lib/actions/storage.actions";
import type { ItemRow, ItemDetailRow } from "@/lib/types/domain/item";

// UI 전용 폼 스키마
const itemDetailFormSchema = z.object({
  description_short: z.string().nullable(),
  item_img: z.string().nullable(),
  item_thumbnail_small: z.string().nullable(),
  item_thumbnail_big: z.string().nullable(),
  item_detail_img_adv: z.string().nullable(),
  item_detail_img_detail: z.string().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type ItemDetailFormValues = z.infer<typeof itemDetailFormSchema>;

// 이미지 필드 키 타입
type ImageFieldKey =
  | "item_img"
  | "item_thumbnail_small"
  | "item_thumbnail_big"
  | "item_detail_img_adv"
  | "item_detail_img_detail";

const itemColumns: DataTableColumn<ItemRow>[] = [
  { key: "sku", header: "SKU", className: "w-28" },
  { key: "name", header: "상품명" },
  { key: "category_name", header: "카테고리" },
  {
    key: "sale_price",
    header: "판매가",
    render: (row) => <PriceDisplay amount={row.sale_price ?? 0} />,
  },
  {
    key: "status",
    header: "상태",
    render: (row) => <DomainBadge type="item" status={row.status ?? ""} />,
  },
];

interface ItemDetailManageClientProps {
  stores: { store_id: string; name: string }[];
}

export function ItemDetailManageClient({ stores }: ItemDetailManageClientProps) {
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0]?.store_id ?? "");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [items, setItems] = useState<ItemRow[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemRow | null>(null);
  const [currentDetail, setCurrentDetail] = useState<ItemDetailRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 각 이미지 필드별 업로드 파일을 ref로 관리
  const pendingFilesRef = useRef<Partial<Record<ImageFieldKey, File | null>>>({});

  const form = useForm<ItemDetailFormValues>({
    resolver: zodResolver(itemDetailFormSchema),
    defaultValues: {
      description_short: null,
      item_img: null,
      item_thumbnail_small: null,
      item_thumbnail_big: null,
      item_detail_img_adv: null,
      item_detail_img_detail: null,
      status: "ACTIVE",
    },
  });

  const isDirty = form.formState.isDirty;

  // 조회 버튼 클릭
  const handleSearch = useCallback(async () => {
    if (!selectedStoreId) {
      toast.warning("가게를 선택해 주세요.");
      return;
    }
    setIsLoading(true);
    setSelectedItem(null);
    setCurrentDetail(null);
    form.reset({
      description_short: null,
      item_img: null,
      item_thumbnail_small: null,
      item_thumbnail_big: null,
      item_detail_img_adv: null,
      item_detail_img_detail: null,
      status: "ACTIVE",
    });
    pendingFilesRef.current = {};

    const result = await fetchItemsByStore({
      store_id: selectedStoreId,
      category: categoryFilter !== "ALL" ? categoryFilter : undefined,
      page: 1,
      pageSize: 50,
    });

    setIsLoading(false);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    setItems(result.data.data);
  }, [selectedStoreId, categoryFilter, form]);

  // 초기화 버튼 클릭
  const handleReset = useCallback(() => {
    setSelectedStoreId(stores[0]?.store_id ?? "");
    setCategoryFilter("ALL");
    setItems([]);
    setSelectedItem(null);
    setCurrentDetail(null);
    pendingFilesRef.current = {};
    form.reset();
  }, [stores, form]);

  // 상품 행 선택
  const handleItemSelect = useCallback(
    async (item: ItemRow) => {
      if (isDirty) {
        // 변경 내용 있으면 경고 후 진행
        const ok = window.confirm(
          "저장하지 않은 변경사항이 있습니다. 다른 상품을 선택하면 변경사항이 사라집니다. 계속하시겠습니까?"
        );
        if (!ok) return;
      }
      setSelectedItem(item);
      setCurrentDetail(null);
      pendingFilesRef.current = {};
      setIsDetailLoading(true);

      const result = await fetchItemDetailByItem({ item_id: item.item_id });
      setIsDetailLoading(false);

      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }

      const details = result.data;
      if (details.length > 0) {
        const detail = details[0];
        setCurrentDetail(detail);
        form.reset({
          description_short: detail.description_short ?? null,
          item_img: detail.item_img ?? null,
          item_thumbnail_small: detail.item_thumbnail_small ?? null,
          item_thumbnail_big: detail.item_thumbnail_big ?? null,
          item_detail_img_adv: detail.item_detail_img_adv ?? null,
          item_detail_img_detail: detail.item_detail_img_detail ?? null,
          status: (detail.status as "ACTIVE" | "INACTIVE") ?? "ACTIVE",
        });
      } else {
        // item_detail이 없는 경우 빈 폼 표시
        form.reset({
          description_short: null,
          item_img: null,
          item_thumbnail_small: null,
          item_thumbnail_big: null,
          item_detail_img_adv: null,
          item_detail_img_detail: null,
          status: "ACTIVE",
        });
      }
    },
    [isDirty, form]
  );

  // 이미지 필드 핸들러 (onFileSelect: File 객체를 직접 받음)
  const handleFileSelect = useCallback((field: ImageFieldKey, file: File | null) => {
    pendingFilesRef.current[field] = file;
  }, []);

  // 이미지 업로드 처리
  const uploadImageIfNeeded = async (field: ImageFieldKey): Promise<string | null | undefined> => {
    const file = pendingFilesRef.current[field];
    if (!file) return undefined; // 변경 없음 → undefined (업데이트 제외)
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadImageAction("item-images", fd);
    if (!result.ok) {
      toast.error(`이미지 업로드 실패: ${field}`);
      return undefined;
    }
    return result.url;
  };

  // 저장 버튼 클릭
  const handleSave = async (values: ItemDetailFormValues) => {
    if (!selectedItem) return;
    setIsSaving(true);

    // 변경된 이미지 필드만 업로드
    const imageFields: ImageFieldKey[] = [
      "item_img",
      "item_thumbnail_small",
      "item_thumbnail_big",
      "item_detail_img_adv",
      "item_detail_img_detail",
    ];
    const uploadResults = await Promise.all(imageFields.map((f) => uploadImageIfNeeded(f)));
    const [
      item_img,
      item_thumbnail_small,
      item_thumbnail_big,
      item_detail_img_adv,
      item_detail_img_detail,
    ] = uploadResults;

    // undefined는 변경 없음, null은 삭제
    const resolveUrl = (uploadedUrl: string | null | undefined, formUrl: string | null) => {
      if (uploadedUrl !== undefined) return uploadedUrl;
      return formUrl;
    };

    if (currentDetail) {
      // 수정
      const result = await updateItemDetail({
        item_detail_id: currentDetail.item_detail_id,
        description_short: values.description_short,
        item_img: resolveUrl(item_img, values.item_img),
        item_thumbnail_small: resolveUrl(item_thumbnail_small, values.item_thumbnail_small),
        item_thumbnail_big: resolveUrl(item_thumbnail_big, values.item_thumbnail_big),
        item_detail_img_adv: resolveUrl(item_detail_img_adv, values.item_detail_img_adv),
        item_detail_img_detail: resolveUrl(item_detail_img_detail, values.item_detail_img_detail),
        status: values.status,
      });
      setIsSaving(false);
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      setCurrentDetail(result.data);
      pendingFilesRef.current = {};
      form.reset(values); // dirty 상태 초기화
      toast.success("상품설명이 수정되었습니다.");
    } else {
      // 신규 생성
      const storeId = selectedItem.store_id;
      const result = await createItemDetail({
        item_id: selectedItem.item_id,
        store_id: storeId,
        description_short: values.description_short,
        item_img: item_img ?? values.item_img,
        item_thumbnail_small: item_thumbnail_small ?? values.item_thumbnail_small,
        item_thumbnail_big: item_thumbnail_big ?? values.item_thumbnail_big,
        item_detail_img_adv: item_detail_img_adv ?? values.item_detail_img_adv,
        item_detail_img_detail: item_detail_img_detail ?? values.item_detail_img_detail,
        status: values.status,
      });
      setIsSaving(false);
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      setCurrentDetail(result.data);
      pendingFilesRef.current = {};
      form.reset(values);
      toast.success("상품설명이 등록되었습니다.");
    }
  };

  // 닫기 버튼 클릭
  const handleClose = () => {
    if (isDirty) {
      setShowCloseConfirm(true);
    } else {
      clearDetail();
    }
  };

  const clearDetail = () => {
    setSelectedItem(null);
    setCurrentDetail(null);
    pendingFilesRef.current = {};
    form.reset();
  };

  // 행삭제 (소프트 삭제)
  const handleDeleteDetail = async () => {
    if (!currentDetail) return;
    const result = await softDeleteItemDetail({ item_detail_id: currentDetail.item_detail_id });
    setShowDeleteConfirm(false);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    toast.success("상품설명이 삭제되었습니다.");
    clearDetail();
  };

  const selectedStoreName = stores.find((s) => s.store_id === selectedItem?.store_id)?.name ?? "";

  return (
    <div className="flex flex-col">
      {/* 검색조건 영역 */}
      <div className="border-separator border-b p-4">
        <div className="flex flex-wrap items-end gap-3">
          <QueryField label="가게명" required>
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="가게 선택" />
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
              categories={ITEM_CATEGORIES}
              placeholder="전체"
            />
          </QueryField>
          <QueryActions onSearch={handleSearch} onReset={handleReset} loading={isLoading} />
        </div>
      </div>

      {/* 상품목록 그리드 */}
      <div className="border-separator border-b p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">상품목록 : item</h3>
          {currentDetail && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="h-7 text-xs"
            >
              -행삭제
            </Button>
          )}
        </div>
        <DataTable
          columns={itemColumns}
          data={items}
          rowKey={(row) => row.item_id}
          loading={isLoading}
          showRowActions={false}
          onRowClick={handleItemSelect}
          emptyMessage="조회 버튼을 클릭하여 상품을 검색하세요."
          rowClassName={(row) =>
            selectedItem?.item_id === row.item_id ? "bg-primary/10 font-medium" : ""
          }
        />
      </div>

      {/* 상품설명 입력/수정 영역 */}
      {selectedItem && (
        <div className="p-4">
          <h3 className="border-separator mb-4 border-b pb-2 text-sm font-medium">
            상품설명 - item_detail
          </h3>

          {isDetailLoading ? (
            <div className="text-text-placeholder py-8 text-center text-sm">
              상품설명 정보를 불러오는 중...
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                {/* 기본 정보 (읽기전용) */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-text-placeholder text-xs">* 상품설명ID</label>
                    <Input
                      value={currentDetail?.item_detail_id ?? "(신규)"}
                      readOnly
                      className="bg-panel text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-text-placeholder text-xs">* 상품명</label>
                    <Input value={selectedItem.name ?? ""} readOnly className="bg-panel text-xs" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-text-placeholder text-xs">* 가게명</label>
                    <Input value={selectedStoreName} readOnly className="bg-panel text-xs" />
                  </div>
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-placeholder text-xs">* 상태</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-xs">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                            <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 짧은설명 */}
                <FormField
                  control={form.control}
                  name="description_short"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-placeholder text-xs">* 짧은설명</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="상품의 짧은 설명을 입력하세요"
                          rows={3}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                          className="text-xs"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 이미지 영역 */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {/* 상품이미지 */}
                  <FormField
                    control={form.control}
                    name="item_img"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-placeholder text-xs">
                          * 상품이미지
                        </FormLabel>
                        <FormControl>
                          <ImageUploader
                            value={field.value}
                            onChange={(url) => field.onChange(url)}
                            onFileSelect={(file) => handleFileSelect("item_img", file)}
                            expectedWidth={375}
                            expectedHeight={375}
                            autoResize
                            sizeHint="상품 이미지 (375×375px)"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 상품상세이미지(광고) */}
                  <FormField
                    control={form.control}
                    name="item_detail_img_adv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-placeholder text-xs">
                          * 상품상세 이미지(광고)
                        </FormLabel>
                        <FormControl>
                          <ImageUploader
                            value={field.value}
                            onChange={(url) => field.onChange(url)}
                            onFileSelect={(file) => handleFileSelect("item_detail_img_adv", file)}
                            expectedWidth={340}
                            autoResize
                            sizeHint="상품상세 이미지(광고) — 가로 340px 고정"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 상품상세이미지(상세) */}
                  <FormField
                    control={form.control}
                    name="item_detail_img_detail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-placeholder text-xs">
                          * 상품상세 이미지(상세)
                        </FormLabel>
                        <FormControl>
                          <ImageUploader
                            value={field.value}
                            onChange={(url) => field.onChange(url)}
                            onFileSelect={(file) =>
                              handleFileSelect("item_detail_img_detail", file)
                            }
                            expectedWidth={340}
                            autoResize
                            sizeHint="상품상세 이미지(상세) — 가로 340px 고정"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 썸네일 영역 */}
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                  {/* 썸네일(소) */}
                  <FormField
                    control={form.control}
                    name="item_thumbnail_small"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-placeholder text-xs">
                          * 상품이미지 썸네일(소)
                        </FormLabel>
                        <FormControl>
                          <ImageUploader
                            value={field.value}
                            onChange={(url) => field.onChange(url)}
                            onFileSelect={(file) => handleFileSelect("item_thumbnail_small", file)}
                            expectedWidth={80}
                            expectedHeight={80}
                            autoResize
                            sizeHint="상품 이미지 썸네일(소) (80×80px)"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 썸네일(대) */}
                  <FormField
                    control={form.control}
                    name="item_thumbnail_big"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-placeholder text-xs">
                          * 상품이미지 썸네일(대)
                        </FormLabel>
                        <FormControl>
                          <ImageUploader
                            value={field.value}
                            onChange={(url) => field.onChange(url)}
                            onFileSelect={(file) => handleFileSelect("item_thumbnail_big", file)}
                            expectedWidth={110}
                            expectedHeight={110}
                            autoResize
                            sizeHint="상품 이미지 썸네일(대) (110×110px)"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 생성/수정일시 */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-text-placeholder text-xs">* 생성일시</label>
                    <Input
                      value={currentDetail?.created_at ?? ""}
                      readOnly
                      className="bg-panel text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-text-placeholder text-xs">* 수정일시</label>
                    <Input
                      value={currentDetail?.modified_at ?? ""}
                      readOnly
                      className="bg-panel text-xs"
                    />
                  </div>
                </div>

                {/* 닫기/저장 버튼 */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline-gray" onClick={handleClose}>
                    닫기
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSaving}>
                    {isSaving ? "저장 중..." : "저장"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      )}

      {/* 닫기 확인 다이얼로그 */}
      <ConfirmDialog
        open={showCloseConfirm}
        onOpenChange={setShowCloseConfirm}
        title="변경사항 있음"
        description="저장하지 않은 변경사항이 있습니다. 닫으시겠습니까?"
        onConfirm={() => {
          setShowCloseConfirm(false);
          clearDetail();
        }}
        confirmLabel="닫기"
      />

      {/* 행삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="상품설명 삭제"
        description={`'${selectedItem?.name}' 상품의 설명을 삭제하시겠습니까? (INACTIVE 처리)`}
        onConfirm={handleDeleteDetail}
        confirmLabel="삭제"
      />
    </div>
  );
}
