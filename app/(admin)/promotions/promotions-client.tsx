"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { QueryField } from "@/components/admin/query-field";
import { QueryActions } from "@/components/admin/query-actions";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { PromotionRegisterDialog } from "@/app/(admin)/promotions/_components/promotion-register-dialog";
import {
  PromotionItemsPanel,
  type PromotionTabData,
} from "@/app/(admin)/promotions/_components/promotion-items-panel";
import {
  fetchPromotionsByStore,
  softDeletePromotion,
  fetchPromotionTabs,
} from "@/lib/actions/domain/promotion.actions";
import type { PromotionRow } from "@/lib/types/domain/promotion";

// ─── 상수 ─────────────────────────────────────────────────────────────────────

const PROMO_TYPE_LABELS: Record<string, string> = {
  SALE: "세일",
  DISCOUNT_PCT: "% 할인",
  DISCOUNT_FIXED: "정액 할인",
  ONE_PLUS_ONE: "1+1",
  TWO_PLUS_ONE: "2+1",
  BUNDLE: "묶음",
};

const EMPTY_TAB_DATA: PromotionTabData = {
  promotionItems: [],
  storeItems: [],
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface PromotionsClientProps {
  stores: { store_id: string; name: string }[];
  initialStoreId: string;
  initialPromotions: PromotionRow[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PromotionsClient({
  stores,
  initialStoreId,
  initialPromotions,
}: PromotionsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 검색조건
  const [selectedStoreId, setSelectedStoreId] = useState(initialStoreId);

  // Panel 1 상태
  const [promotions, setPromotions] = useState<PromotionRow[]>(initialPromotions);
  const [activePromoId, setActivePromoId] = useState<string | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editPromo, setEditPromo] = useState<PromotionRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PromotionRow | null>(null);

  // Panel 2 상태
  const [tabData, setTabData] = useState<PromotionTabData>(EMPTY_TAB_DATA);
  const [tabLoading, setTabLoading] = useState(false);

  // ─── 검색 ─────────────────────────────────────────────────────────────────

  const handleSearch = () => {
    if (!selectedStoreId) {
      toast.error("가게를 선택하세요.");
      return;
    }
    startTransition(async () => {
      const result = await fetchPromotionsByStore({ store_id: selectedStoreId });
      if (!result.ok) {
        toast.error(result.error.message ?? "조회 실패");
        return;
      }
      setPromotions(result.data as PromotionRow[]);
      setActivePromoId(null);
      setTabData(EMPTY_TAB_DATA);
    });
  };

  const handleReset = () => {
    setSelectedStoreId(stores[0]?.store_id ?? "");
    router.refresh();
  };

  // ─── Panel 1: 행 클릭 → Panel 2 로드 ────────────────────────────────────

  const handleRowClick = useCallback(
    async (row: PromotionRow) => {
      if (row.promo_id === activePromoId) return;
      setActivePromoId(row.promo_id);
      setTabLoading(true);
      setTabData(EMPTY_TAB_DATA);

      const result = await fetchPromotionTabs({
        promo_id: row.promo_id,
        store_id: selectedStoreId,
      });
      setTabLoading(false);
      if (!result.ok) {
        toast.error("상품 데이터 로딩 실패");
        return;
      }
      setTabData(result.data as PromotionTabData);
    },
    [activePromoId, selectedStoreId]
  );

  // ─── Panel 1: 등록/수정/삭제 ─────────────────────────────────────────────

  const handlePromoSuccess = (row: PromotionRow) => {
    if (editPromo) {
      setPromotions((prev) => prev.map((p) => (p.promo_id === row.promo_id ? row : p)));
    } else {
      setPromotions((prev) => [row, ...prev]);
    }
    setEditPromo(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await softDeletePromotion({ promo_id: deleteTarget.promo_id });
    if (!result.ok) {
      toast.error(result.error.message ?? "삭제 실패");
      setDeleteTarget(null);
      return;
    }
    toast.success("프로모션이 삭제(종료 처리)되었습니다.");
    setPromotions((prev) => prev.filter((p) => p.promo_id !== deleteTarget.promo_id));
    if (activePromoId === deleteTarget.promo_id) {
      setActivePromoId(null);
      setTabData(EMPTY_TAB_DATA);
    }
    setDeleteTarget(null);
  };

  // ─── Panel 2 데이터 변경 ─────────────────────────────────────────────────

  const handleTabDataChange = useCallback((partial: Partial<PromotionTabData>) => {
    setTabData((prev) => ({ ...prev, ...partial }));
  }, []);

  // ─── 컬럼 정의 ───────────────────────────────────────────────────────────

  const columns: DataTableColumn<PromotionRow>[] = [
    {
      key: "name",
      header: "프로모션명",
    },
    {
      key: "type",
      header: "유형",
      render: (row) => PROMO_TYPE_LABELS[row.type] ?? row.type,
    },
    {
      key: "status",
      header: "상태",
      render: (row) => <DomainBadge type="promotion" status={row.status ?? ""} />,
    },
    {
      key: "start_at",
      header: "시작일",
      render: (row) => row.start_at?.slice(0, 10) ?? "-",
    },
    {
      key: "end_at",
      header: "종료일",
      render: (row) => row.end_at?.slice(0, 10) ?? "-",
    },
    {
      key: "priority",
      header: "우선순위",
      render: (row) => row.priority?.toString() ?? "0",
    },
  ];

  return (
    <div className="flex h-full flex-col gap-0">
      {/* 검색조건 영역 */}
      <div className="bg-muted/30 flex flex-wrap items-end gap-3 border-b p-4">
        <QueryField label="가게명" required>
          {stores.length === 0 ? (
            <p className="text-muted-foreground text-sm">소속 가게 없음</p>
          ) : (
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="가게 선택" />
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
        <QueryActions onSearch={handleSearch} onReset={handleReset} loading={isPending} />
      </div>

      {/* 2-패널 MDI 영역 */}
      <div className="flex min-h-0 flex-1 flex-col divide-y">
        {/* Panel 1: 프로모션 목록 */}
        <div className="min-h-0 overflow-auto p-4" style={{ flex: "0 0 auto", maxHeight: "40vh" }}>
          <DataTable
            columns={columns}
            data={promotions}
            rowKey={(row) => row.promo_id}
            activeRowKey={activePromoId ?? undefined}
            onRowClick={handleRowClick}
            searchPlaceholder="프로모션명 검색"
            toolbarActions={
              <Button
                size="sm"
                onClick={() => {
                  setEditPromo(null);
                  setRegisterOpen(true);
                }}
                disabled={!selectedStoreId}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                프로모션 등록
              </Button>
            }
            showRowActions
            onRowEdit={(row) => {
              setEditPromo(row);
              setRegisterOpen(true);
            }}
            onRowDelete={(row) => setDeleteTarget(row)}
            emptyMessage="조회 조건을 설정하고 조회 버튼을 클릭하세요."
          />
        </div>

        {/* Panel 2: 상품 관리 (프로모션 선택 시 표시) */}
        <div className="min-h-0 flex-1 overflow-auto">
          {activePromoId ? (
            tabLoading ? (
              <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
                상품 데이터 로딩 중...
              </div>
            ) : (
              <PromotionItemsPanel
                promoId={activePromoId}
                storeId={selectedStoreId}
                tabData={tabData}
                onTabDataChange={handleTabDataChange}
              />
            )
          ) : (
            <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
              프로모션을 선택하면 상품을 등록·관리할 수 있습니다.
            </div>
          )}
        </div>
      </div>

      {/* 등록/수정 다이얼로그 */}
      <PromotionRegisterDialog
        open={registerOpen}
        onOpenChange={(open) => {
          setRegisterOpen(open);
          if (!open) setEditPromo(null);
        }}
        storeId={selectedStoreId}
        editTarget={editPromo}
        onSuccess={handlePromoSuccess}
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="프로모션 삭제"
        description={`'${deleteTarget?.name}' 프로모션을 삭제(종료 처리)하시겠습니까?`}
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
