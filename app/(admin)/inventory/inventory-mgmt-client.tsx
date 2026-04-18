"use client";

import { useState, useCallback, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { PriceDisplay } from "@/components/admin/domain/price-display";
import { CategorySelect } from "@/components/admin/domain/category-select";
import { useCategoryOptions } from "@/lib/hooks/use-category-options";
import { QueryField } from "@/components/admin/query-field";
import { QueryActions } from "@/components/admin/query-actions";
import {
  fetchItemsForInventory,
  fetchInventoryByStore,
  createInventoryBatch,
  updateInventoryBatch,
  deactivateInventoryBatch,
  getInventoryTxnList,
} from "@/lib/actions/domain/inventory.actions";
import type { Database } from "@/lib/supabase/database.types";
import {
  Plus,
  Ban,
  Save,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// 타입 정의
type ItemRow = Database["public"]["Tables"]["item"]["Row"];
type InventoryRow = Database["public"]["Tables"]["inventory"]["Row"];
type InventoryTxnRow = Database["public"]["Tables"]["inventory_txn"]["Row"];

type InventoryWithItem = InventoryRow & {
  item: ItemRow | null;
  // 편의 필드 (item에서 추출)
  item_name: string;
  item_sku: string;
  category_name: string;
};

// 인라인 편집 변경 추적용 타입
type EditedField = {
  on_hand: number;
  safety_stock: number;
};

interface InventoryMgmtClientProps {
  stores: { store_id: string; name: string; tenant_code: string }[];
}

/** 재고 row를 편의 필드 포함 형태로 정규화 */
function normalizeInventory(raw: InventoryRow & { item: ItemRow | null }): InventoryWithItem {
  return {
    ...raw,
    item: raw.item,
    item_name: raw.item?.name ?? "-",
    item_sku: raw.item?.sku ?? "-",
    category_name: raw.item?.category_name ?? "-",
  };
}

// ─── Panel 1: 상품목록 컬럼 정의 ─────────────────────────────────────────────
const itemColumns: DataTableColumn<ItemRow>[] = [
  { key: "sku", header: "SKU", className: "w-28 whitespace-nowrap" },
  { key: "name", header: "상품이름" },
  { key: "category_name", header: "카테고리명" },
  {
    key: "list_price",
    header: "가격",
    render: (row) => <PriceDisplay amount={row.list_price ?? 0} />,
  },
  {
    key: "sale_price",
    header: "세일가격",
    render: (row) => <PriceDisplay amount={row.sale_price ?? 0} />,
  },
  {
    key: "ranking",
    header: "랭킹",
    render: (row) =>
      row.ranking != null ? (
        <span>{row.ranking}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
    className: "w-16 text-center",
  },
  {
    key: "status",
    header: "상태",
    render: (row) => <DomainBadge type="item" status={row.status ?? ""} />,
  },
];

export function InventoryMgmtClient({ stores }: InventoryMgmtClientProps) {
  const [isPending, startTransition] = useTransition();

  // ─── 검색 조건 ──────────────────────────────────────────────────────────────
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0]?.store_id ?? "");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [itemNameSearch, setItemNameSearch] = useState("");

  const selectedStore = stores.find((s) => s.store_id === selectedStoreId);
  const { categories, loading: categoriesLoading } = useCategoryOptions(
    selectedStore?.tenant_code ?? null
  );

  // ─── Panel 1: 상품 목록 ─────────────────────────────────────────────────────
  const [items, setItems] = useState<ItemRow[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsPage, setItemsPage] = useState(1);
  const [itemsTotal, setItemsTotal] = useState(0);
  const ITEMS_PAGE_SIZE = 50;
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // ─── Panel 2: 재고 목록 ─────────────────────────────────────────────────────
  const [inventories, setInventories] = useState<InventoryWithItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryPage, setInventoryPage] = useState(1);
  const INV_PAGE_SIZE = 30;
  const [selectedInvIds, setSelectedInvIds] = useState<Set<string>>(new Set());
  // 인라인 편집: inventory_id → { on_hand, safety_stock } 변경값 맵
  const [editedFields, setEditedFields] = useState<Map<string, EditedField>>(new Map());
  const [activeInvId, setActiveInvId] = useState<string | null>(null);

  // ─── Panel 3: 재고 트랜잭션 ──────────────────────────────────────────────────
  const [txnHistory, setTxnHistory] = useState<InventoryTxnRow[]>([]);
  const [txnLoading, setTxnLoading] = useState(false);
  const [txnPanelOpen, setTxnPanelOpen] = useState(false);
  const [txnInvName, setTxnInvName] = useState("");

  // ─── 확인 다이얼로그 ─────────────────────────────────────────────────────────
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);
  const [unsavedConfirmOpen, setUnsavedConfirmOpen] = useState(false);
  const [unsavedAction, setUnsavedAction] = useState<(() => void) | null>(null);

  const isDirty = editedFields.size > 0;

  // 미저장 변경 보호: 변경이 있으면 확인 다이얼로그 후 진행
  const withUnsavedGuard = useCallback(
    (action: () => void) => {
      if (isDirty) {
        setUnsavedAction(() => action);
        setUnsavedConfirmOpen(true);
      } else {
        action();
      }
    },
    [isDirty]
  );

  // ─── 조회 ────────────────────────────────────────────────────────────────────
  const doSearch = useCallback(
    async (page = 1) => {
      if (!selectedStoreId) {
        toast.warning("가게를 선택해 주세요.");
        return;
      }
      setItemsLoading(true);
      setInventoryLoading(true);
      setSelectedItemIds(new Set());
      setSelectedInvIds(new Set());
      setActiveInvId(null);
      setTxnPanelOpen(false);

      const [itemResult, invResult] = await Promise.all([
        fetchItemsForInventory({
          store_id: selectedStoreId,
          category: categoryFilter !== "ALL" ? categoryFilter : undefined,
          search: itemNameSearch.trim() || undefined,
          page,
          pageSize: ITEMS_PAGE_SIZE,
        }),
        fetchInventoryByStore({
          store_id: selectedStoreId,
          category: categoryFilter !== "ALL" ? categoryFilter : undefined,
          search: itemNameSearch.trim() || undefined,
        }),
      ]);

      setItemsLoading(false);
      setInventoryLoading(false);

      if (!itemResult.ok) {
        toast.error(itemResult.error.message);
      } else {
        setItems(itemResult.data.data);
        setItemsTotal(itemResult.data.totalCount);
        setItemsPage(page);
      }

      if (!invResult.ok) {
        toast.error(invResult.error.message);
      } else {
        const normalized = (invResult.data as (InventoryRow & { item: ItemRow | null })[]).map(
          normalizeInventory
        );
        setInventories(normalized);
        setEditedFields(new Map()); // 조회 시 편집 초기화
      }
    },
    [selectedStoreId, categoryFilter, itemNameSearch]
  );

  const handleSearch = useCallback(() => {
    withUnsavedGuard(() => doSearch(1));
  }, [doSearch, withUnsavedGuard]);

  const handleReset = useCallback(() => {
    withUnsavedGuard(() => {
      setCategoryFilter("ALL");
      setItemNameSearch("");
      setItems([]);
      setInventories([]);
      setItemsTotal(0);
      setItemsPage(1);
      setInventoryPage(1);
      setSelectedItemIds(new Set());
      setSelectedInvIds(new Set());
      setEditedFields(new Map());
      setActiveInvId(null);
      setTxnPanelOpen(false);
    });
  }, [withUnsavedGuard]);

  const handleItemsPageChange = useCallback(
    (page: number) => {
      doSearch(page);
    },
    [doSearch]
  );

  // ─── 재고 생성 ───────────────────────────────────────────────────────────────
  const handleCreateInventory = useCallback(() => {
    if (selectedItemIds.size === 0) {
      toast.warning("상품목록에서 재고를 생성할 상품을 선택해 주세요.");
      return;
    }
    if (!selectedStoreId) return;

    startTransition(async () => {
      const result = await createInventoryBatch({
        store_id: selectedStoreId,
        items: Array.from(selectedItemIds).map((item_id) => ({
          item_id,
          on_hand: 0,
          safety_stock: 0,
        })),
      });

      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }

      const { createdCount, reactivatedCount, skippedCount } = result.data;
      const parts: string[] = [];
      if (createdCount > 0) parts.push(`${createdCount}건 생성`);
      if (reactivatedCount > 0) parts.push(`${reactivatedCount}건 재활성화`);
      if (skippedCount > 0) parts.push(`${skippedCount}건 이미 존재`);

      if (createdCount > 0 || reactivatedCount > 0) {
        toast.success(parts.join(", ") + " 완료");
      } else {
        toast.info("선택한 상품의 재고가 이미 모두 존재합니다.");
      }

      setSelectedItemIds(new Set());

      // 재고 목록 갱신
      const invResult = await fetchInventoryByStore({
        store_id: selectedStoreId,
        category: categoryFilter !== "ALL" ? categoryFilter : undefined,
        search: itemNameSearch.trim() || undefined,
      });
      if (invResult.ok) {
        const normalized = (invResult.data as (InventoryRow & { item: ItemRow | null })[]).map(
          normalizeInventory
        );
        setInventories(normalized);
        setEditedFields(new Map());
      }
    });
  }, [selectedItemIds, selectedStoreId, categoryFilter, itemNameSearch]);

  // ─── 재고 비활성화 ───────────────────────────────────────────────────────────
  const handleDeactivate = useCallback(() => {
    if (selectedInvIds.size === 0) {
      toast.warning("중지할 재고를 선택해 주세요.");
      return;
    }
    setDeactivateConfirmOpen(true);
  }, [selectedInvIds]);

  const doDeactivate = useCallback(() => {
    startTransition(async () => {
      const result = await deactivateInventoryBatch({
        inventory_ids: Array.from(selectedInvIds),
      });

      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }

      toast.success(`${result.data.deactivatedCount}건 중지 처리되었습니다.`);
      setSelectedInvIds(new Set());

      // 재고 목록 갱신 (현재 검색 조건 유지)
      if (selectedStoreId) {
        const invResult = await fetchInventoryByStore({
          store_id: selectedStoreId,
          category: categoryFilter !== "ALL" ? categoryFilter : undefined,
          search: itemNameSearch.trim() || undefined,
        });
        if (invResult.ok) {
          const normalized = (invResult.data as (InventoryRow & { item: ItemRow | null })[]).map(
            normalizeInventory
          );
          setInventories(normalized);
          setEditedFields(new Map());
        }
      }
    });
  }, [selectedInvIds, selectedStoreId, categoryFilter, itemNameSearch]);

  // ─── 인라인 편집 ──────────────────────────────────────────────────────────────
  const handleFieldEdit = useCallback(
    (inventoryId: string, field: "on_hand" | "safety_stock", value: number) => {
      setEditedFields((prev) => {
        const next = new Map(prev);
        const inv = inventories.find((i) => i.inventory_id === inventoryId);
        const current = next.get(inventoryId) ?? {
          on_hand: inv?.on_hand ?? 0,
          safety_stock: inv?.safety_stock ?? 0,
        };
        next.set(inventoryId, { ...current, [field]: value });
        return next;
      });
    },
    [inventories]
  );

  // ─── 저장 ────────────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (editedFields.size === 0) {
      toast.info("변경된 내용이 없습니다.");
      return;
    }

    startTransition(async () => {
      const updates = Array.from(editedFields.entries()).map(([inventory_id, fields]) => ({
        inventory_id,
        on_hand: fields.on_hand,
        safety_stock: fields.safety_stock,
      }));

      const result = await updateInventoryBatch({ updates });

      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }

      toast.success(`${result.data.updatedCount}건 저장되었습니다.`);
      setEditedFields(new Map());

      // 재고 목록 갱신
      if (selectedStoreId) {
        const invResult = await fetchInventoryByStore({ store_id: selectedStoreId });
        if (invResult.ok) {
          const normalized = (invResult.data as (InventoryRow & { item: ItemRow | null })[]).map(
            normalizeInventory
          );
          setInventories(normalized);
        }
      }
    });
  }, [editedFields, selectedStoreId]);

  // ─── 재고 트랜잭션 조회 ───────────────────────────────────────────────────────
  const handleInventoryClick = useCallback(async (inv: InventoryWithItem) => {
    setActiveInvId(inv.inventory_id);
    setTxnPanelOpen(true);
    setTxnInvName(inv.item_name);
    setTxnLoading(true);
    setTxnHistory([]);

    const result = await getInventoryTxnList({ inventory_id: inv.inventory_id });
    setTxnLoading(false);

    if (!result.ok) {
      toast.error("트랜잭션 이력을 불러오지 못했습니다.");
      return;
    }
    setTxnHistory(result.data as InventoryTxnRow[]);
  }, []);

  const handleCloseTxnPanel = useCallback(() => {
    setTxnPanelOpen(false);
    setActiveInvId(null);
  }, []);

  // ─── 재고 그리드 인라인 편집 렌더러 ──────────────────────────────────────────
  const getInventoryDisplayValue = useCallback(
    (inv: InventoryWithItem, field: "on_hand" | "safety_stock"): number => {
      return editedFields.get(inv.inventory_id)?.[field] ?? inv[field];
    },
    [editedFields]
  );

  // ─── 페이지네이션 헬퍼 (재고 클라이언트 사이드) ───────────────────────────────
  const invTotalPages = Math.ceil(inventories.length / INV_PAGE_SIZE);
  const pagedInventories = inventories.slice(
    (inventoryPage - 1) * INV_PAGE_SIZE,
    inventoryPage * INV_PAGE_SIZE
  );
  const invAllKeys = pagedInventories.map((i) => i.inventory_id);
  const invAllSelected = invAllKeys.length > 0 && invAllKeys.every((k) => selectedInvIds.has(k));
  const invSomeSelected = invAllKeys.some((k) => selectedInvIds.has(k));

  const handleInvSelectAll = () => {
    if (invAllSelected) {
      const next = new Set(selectedInvIds);
      invAllKeys.forEach((k) => next.delete(k));
      setSelectedInvIds(next);
    } else {
      const next = new Set(selectedInvIds);
      invAllKeys.forEach((k) => next.add(k));
      setSelectedInvIds(next);
    }
  };

  const handleInvSelectRow = (key: string) => {
    const next = new Set(selectedInvIds);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedInvIds(next);
  };

  const invPageWindows = (): (number | "...")[] => {
    if (invTotalPages <= 7) return Array.from({ length: invTotalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    const rs = Math.max(2, inventoryPage - 2);
    const re = Math.min(invTotalPages - 1, inventoryPage + 2);
    if (rs > 2) pages.push("...");
    for (let p = rs; p <= re; p++) pages.push(p);
    if (re < invTotalPages - 1) pages.push("...");
    pages.push(invTotalPages);
    return pages;
  };

  // ─── 렌더 ────────────────────────────────────────────────────────────────────
  const selectedStoreName = stores.find((s) => s.store_id === selectedStoreId)?.name ?? "";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0">
      {/* ── 검색조건 ── */}
      <div className="border-separator flex flex-wrap items-end gap-3 border-b bg-white px-4 py-3">
        {/* 가게명 */}
        <QueryField label="가게명" required>
          {stores.length <= 1 ? (
            <div className="border-separator bg-panel flex h-9 min-w-[180px] items-center rounded border px-3 text-sm">
              {selectedStoreName || "소속 가게 없음"}
            </div>
          ) : (
            <Select
              value={selectedStoreId}
              onValueChange={(v) =>
                withUnsavedGuard(() => {
                  setSelectedStoreId(v);
                  setCategoryFilter("ALL");
                })
              }
            >
              <SelectTrigger className="h-9 min-w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stores.map((s) => (
                  <SelectItem key={s.store_id} value={s.store_id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </QueryField>

        {/* 카테고리 */}
        <QueryField label="카테고리">
          <CategorySelect
            value={categoryFilter}
            onValueChange={setCategoryFilter}
            categories={categories}
            placeholder="전체"
            disabled={categoriesLoading}
            className="h-9 min-w-[140px]"
          />
        </QueryField>

        {/* 상품명 */}
        <QueryField label="상품명">
          <Input
            placeholder="상품명 검색"
            value={itemNameSearch}
            onChange={(e) => setItemNameSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-9 min-w-[160px]"
          />
        </QueryField>

        <QueryActions
          onSearch={handleSearch}
          onReset={handleReset}
          loading={itemsLoading || inventoryLoading}
        />
      </div>

      {/* ── Panel 1: 상품목록 ── */}
      <div
        className="border-separator flex flex-col border-b px-4 py-3"
        style={{ maxHeight: "38vh" }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            상품목록{" "}
            {itemsTotal > 0 && (
              <span className="text-muted-foreground font-normal">
                (총 {itemsTotal}건{selectedItemIds.size > 0 && ` · ${selectedItemIds.size}건 선택`})
              </span>
            )}
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <DataTable
            columns={itemColumns}
            data={items}
            rowKey={(row) => row.item_id}
            loading={itemsLoading}
            emptyMessage="조회 버튼을 눌러 상품을 검색하세요."
            showRowActions={false}
            hideSearch
            selectable
            selectedKeys={selectedItemIds}
            onSelectionChange={setSelectedItemIds}
            pagination={
              itemsTotal > 0
                ? { page: itemsPage, pageSize: ITEMS_PAGE_SIZE, total: itemsTotal }
                : undefined
            }
            onPageChange={handleItemsPageChange}
          />
        </div>
      </div>

      {/* ── 하단 분할: Panel 2 + Panel 3 ── */}
      <div className="flex min-h-0 flex-1 divide-x overflow-hidden">
        {/* ── Panel 2: 상품재고 ── */}
        <div
          className={`flex flex-col px-4 py-3 transition-all duration-200 ${
            txnPanelOpen ? "w-1/2" : "w-full"
          }`}
        >
          {/* 재고 액션 버튼 */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              상품재고{" "}
              {inventories.length > 0 && (
                <span className="text-muted-foreground font-normal">
                  (총 {inventories.length}건
                  {selectedInvIds.size > 0 && ` · ${selectedInvIds.size}건 선택`}
                  {isDirty && (
                    <span className="ml-1 text-yellow-600">
                      · 미저장 변경 {editedFields.size}건
                    </span>
                  )}
                  )
                </span>
              )}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline-gray"
                onClick={handleDeactivate}
                disabled={isPending || selectedInvIds.size === 0}
                title="선택 재고 판매 중단 (중지)"
              >
                <Ban className="mr-1 h-3.5 w-3.5" />
                취소
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCreateInventory}
                disabled={isPending || selectedItemIds.size === 0}
                title="상품목록에서 선택한 상품으로 재고 생성"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                생성
              </Button>
            </div>
          </div>

          {/* 재고 그리드 - 인라인 편집 지원 */}
          <div className="border-separator min-h-0 flex-1 overflow-auto rounded border">
            <ScrollArea className="h-full w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-panel hover:bg-panel">
                    <TableHead className="w-10 px-3">
                      <Checkbox
                        checked={invAllSelected ? true : invSomeSelected ? "indeterminate" : false}
                        onCheckedChange={handleInvSelectAll}
                        aria-label="전체 선택"
                      />
                    </TableHead>
                    <TableHead>상품이름</TableHead>
                    <TableHead className="w-28 text-center">현재가용재고</TableHead>
                    <TableHead className="w-24 text-center">홀드수량</TableHead>
                    <TableHead className="w-28 text-center">안전재고</TableHead>
                    <TableHead className="w-28">생성일</TableHead>
                    <TableHead className="w-28">수정일</TableHead>
                    <TableHead className="w-24">상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-sm text-gray-400">
                        불러오는 중...
                      </TableCell>
                    </TableRow>
                  ) : pagedInventories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-sm text-gray-400">
                        {items.length > 0
                          ? "상품목록에서 상품을 선택 후 생성 버튼을 눌러 재고를 추가하세요."
                          : "조회 후 재고를 확인하세요."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedInventories.map((inv) => {
                      const isSelected = selectedInvIds.has(inv.inventory_id);
                      const isActive = activeInvId === inv.inventory_id;
                      const isEdited = editedFields.has(inv.inventory_id);
                      const displayOnHand = getInventoryDisplayValue(inv, "on_hand");
                      const displaySafetyStock = getInventoryDisplayValue(inv, "safety_stock");
                      const isLowStock = displayOnHand < inv.safety_stock;

                      return (
                        <TableRow
                          key={inv.inventory_id}
                          className={[
                            "cursor-pointer",
                            isActive ? "bg-blue-50 hover:bg-blue-100" : "",
                            isEdited ? "bg-yellow-50 hover:bg-yellow-100" : "",
                            isLowStock && !isActive && !isEdited
                              ? "bg-red-50 hover:bg-red-100"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() => handleInventoryClick(inv)}
                          onDoubleClick={() => handleInventoryClick(inv)}
                        >
                          {/* 체크박스 */}
                          <TableCell
                            className="w-10 px-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInvSelectRow(inv.inventory_id);
                            }}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleInvSelectRow(inv.inventory_id)}
                              aria-label={`${inv.item_name} 선택`}
                            />
                          </TableCell>
                          {/* 상품이름 */}
                          <TableCell className="max-w-[200px] truncate" title={inv.item_name}>
                            {inv.item_name}
                          </TableCell>
                          {/* 현재가용재고 - 인라인 편집 */}
                          <TableCell className="w-28 px-2" onClick={(e) => e.stopPropagation()}>
                            <Input
                              type="number"
                              min={0}
                              value={displayOnHand}
                              onChange={(e) =>
                                handleFieldEdit(
                                  inv.inventory_id,
                                  "on_hand",
                                  Math.max(0, parseInt(e.target.value, 10) || 0)
                                )
                              }
                              className={`h-7 w-full text-center text-sm ${
                                isLowStock ? "border-red-400 text-red-600" : ""
                              }`}
                              aria-label="현재가용재고"
                            />
                          </TableCell>
                          {/* 홀드수량 - 읽기전용 */}
                          <TableCell className="w-24 text-center text-sm">{inv.reserved}</TableCell>
                          {/* 안전재고 - 인라인 편집 */}
                          <TableCell className="w-28 px-2" onClick={(e) => e.stopPropagation()}>
                            <Input
                              type="number"
                              min={0}
                              value={displaySafetyStock}
                              onChange={(e) =>
                                handleFieldEdit(
                                  inv.inventory_id,
                                  "safety_stock",
                                  Math.max(0, parseInt(e.target.value, 10) || 0)
                                )
                              }
                              className="h-7 w-full text-center text-sm"
                              aria-label="안전재고"
                            />
                          </TableCell>
                          {/* 생성일 */}
                          <TableCell className="w-28 text-xs text-gray-500">
                            {inv.created_at?.slice(0, 10) ?? "-"}
                          </TableCell>
                          {/* 수정일 */}
                          <TableCell className="w-28 text-xs text-gray-500">
                            {inv.modified_at?.slice(0, 10) ?? "-"}
                          </TableCell>
                          {/* 상태 */}
                          <TableCell className="w-24">
                            <DomainBadge type="inventory" status={inv.status ?? ""} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* 재고 페이지네이션 */}
          {invTotalPages > 1 && (
            <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
              <span>
                {inventories.length}건 / {inventoryPage}/{invTotalPages} 페이지
              </span>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={inventoryPage <= 1}
                  onClick={() => setInventoryPage(1)}
                >
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={inventoryPage <= 1}
                  onClick={() => setInventoryPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                {invPageWindows().map((p, i) =>
                  p === "..." ? (
                    <span key={`e-${i}`} className="px-1 text-xs">
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={inventoryPage === p ? "outline-gray" : "ghost"}
                      size="icon"
                      className={`h-7 w-7 text-xs ${inventoryPage === p ? "font-bold" : ""}`}
                      onClick={() => setInventoryPage(p as number)}
                    >
                      {p}
                    </Button>
                  )
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={inventoryPage >= invTotalPages}
                  onClick={() => setInventoryPage((p) => p + 1)}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={inventoryPage >= invTotalPages}
                  onClick={() => setInventoryPage(invTotalPages)}
                >
                  <ChevronsRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Panel 3: 재고 트랜잭션 ── */}
        {txnPanelOpen && (
          <div className="flex w-1/2 flex-col border-l px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-gray-700">재고트랜잭션</span>
                {txnInvName && (
                  <span className="text-muted-foreground ml-2 truncate text-xs">{txnInvName}</span>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={handleCloseTxnPanel}
                title="닫기"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* 트랜잭션 그리드 */}
            <div className="border-separator min-h-0 flex-1 overflow-auto rounded border">
              <ScrollArea className="h-full w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-panel hover:bg-panel">
                      <TableHead className="w-32">트랜잭션ID</TableHead>
                      <TableHead className="w-28">입출고유형</TableHead>
                      <TableHead className="w-20 text-center">이동수량</TableHead>
                      <TableHead className="w-20 text-center">변경전</TableHead>
                      <TableHead className="w-20 text-center">변경후</TableHead>
                      <TableHead>상세사유</TableHead>
                      <TableHead className="w-20">상태</TableHead>
                      <TableHead className="w-28">일시</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {txnLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-sm text-gray-400">
                          불러오는 중...
                        </TableCell>
                      </TableRow>
                    ) : txnHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-sm text-gray-400">
                          트랜잭션 이력이 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      txnHistory.map((txn) => (
                        <TableRow key={txn.txnId}>
                          <TableCell
                            className="max-w-[120px] truncate text-xs text-gray-500"
                            title={txn.txnId}
                          >
                            {txn.txnId?.slice(0, 8)}…
                          </TableCell>
                          <TableCell className="text-xs font-medium">{txn.type}</TableCell>
                          <TableCell className="text-center text-sm">
                            <span
                              className={
                                txn.type === "INBOUND" || txn.type === "RETURN"
                                  ? "font-semibold text-blue-600"
                                  : "font-semibold text-red-600"
                              }
                            >
                              {txn.type === "INBOUND" || txn.type === "RETURN"
                                ? `+${txn.quantity}`
                                : `-${txn.quantity}`}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {txn.before_quantity}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {txn.after_quantity}
                          </TableCell>
                          <TableCell
                            className="max-w-[120px] truncate text-xs"
                            title={txn.reason ?? ""}
                          >
                            {txn.reason ?? "-"}
                          </TableCell>
                          <TableCell className="text-xs">{txn.status}</TableCell>
                          <TableCell className="text-xs text-gray-500">
                            {txn.created_at?.slice(0, 16).replace("T", " ") ?? "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            {/* 트랜잭션 패널 하단 버튼 */}
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (activeInvId) {
                    const inv = inventories.find((i) => i.inventory_id === activeInvId);
                    if (inv) handleInventoryClick(inv);
                  }
                }}
                disabled={txnLoading}
                title="트랜잭션 새로고침"
              >
                <RefreshCw className="mr-1 h-3.5 w-3.5" />
                새로고침
              </Button>
              <Button size="sm" variant="outline-gray" onClick={handleCloseTxnPanel}>
                <X className="mr-1 h-3.5 w-3.5" />
                닫기
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleSave}
                disabled={isPending || !isDirty}
              >
                <Save className="mr-1 h-3.5 w-3.5" />
                저장
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Panel 3 닫힌 상태 하단 저장 버튼 */}
      {!txnPanelOpen && isDirty && (
        <div className="border-separator flex items-center justify-end gap-2 border-t px-4 py-2">
          <span className="text-sm text-yellow-600">
            {editedFields.size}건 미저장 변경사항이 있습니다.
          </span>
          <Button size="sm" variant="primary" onClick={handleSave} disabled={isPending}>
            <Save className="mr-1 h-3.5 w-3.5" />
            저장
          </Button>
        </div>
      )}

      {/* 비활성화 확인 다이얼로그 */}
      <ConfirmDialog
        open={deactivateConfirmOpen}
        onOpenChange={setDeactivateConfirmOpen}
        title="재고 중지"
        description={`선택한 ${selectedInvIds.size}건의 재고를 중지하시겠습니까? 해당 상품은 온라인 판매가 중단됩니다.`}
        confirmLabel="중지"
        cancelLabel="취소"
        onConfirm={() => {
          setDeactivateConfirmOpen(false);
          doDeactivate();
        }}
        destructive
      />

      {/* 미저장 변경 보호 다이얼로그 */}
      <ConfirmDialog
        open={unsavedConfirmOpen}
        onOpenChange={setUnsavedConfirmOpen}
        title="미저장 변경사항"
        description={`저장하지 않은 변경사항(${editedFields.size}건)이 있습니다. 저장하지 않고 계속하시겠습니까?`}
        confirmLabel="저장하지 않고 계속"
        cancelLabel="취소"
        onConfirm={() => {
          setUnsavedConfirmOpen(false);
          setEditedFields(new Map());
          unsavedAction?.();
          setUnsavedAction(null);
        }}
        destructive={false}
      />
    </div>
  );
}
