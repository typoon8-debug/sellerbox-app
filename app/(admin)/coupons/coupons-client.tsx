"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { CouponRegisterDialog } from "@/app/(admin)/coupons/_components/coupon-register-dialog";
import { CouponTabs, type CouponTabData } from "@/app/(admin)/coupons/_components/coupon-tabs";
import {
  fetchCouponsByStore,
  softDeleteCoupon,
  fetchCouponTabs,
} from "@/lib/actions/domain/coupon.actions";
import type { CouponRow } from "@/lib/types/domain/promotion";

// ─── 상수 ─────────────────────────────────────────────────────────────────────

const COUPON_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ISSUED: { label: "발급", className: "bg-primary-light text-primary border-primary/30" },
  USED: { label: "사용", className: "bg-blue-50 text-blue-700 border-blue-200" },
  EXPIRED: { label: "만료", className: "bg-disabled text-text-placeholder border-separator" },
  CANCELLED: { label: "취소", className: "bg-alert-red-bg text-alert-red border-alert-red/30" },
};

const COUPON_TYPE_LABELS: Record<string, string> = {
  DISCOUNT: "할인",
  SHIPPING_FREE: "무료배송",
  SIGNUP: "신규가입",
};

const EMPTY_TAB_DATA: CouponTabData = {
  issuances: [],
  redemptions: [],
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface CouponsClientProps {
  stores: { store_id: string; name: string }[];
  initialStoreId: string;
  initialCoupons: CouponRow[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CouponsClient({ stores, initialStoreId, initialCoupons }: CouponsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 검색조건
  const [selectedStoreId, setSelectedStoreId] = useState(initialStoreId);

  // Panel 1 상태
  const [coupons, setCoupons] = useState<CouponRow[]>(initialCoupons);
  const [activeCouponId, setActiveCouponId] = useState<string | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<CouponRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CouponRow | null>(null);

  // Panel 2 탭 상태
  const [tabData, setTabData] = useState<CouponTabData>(EMPTY_TAB_DATA);
  const [tabLoading, setTabLoading] = useState(false);

  // ─── 검색 ─────────────────────────────────────────────────────────────────

  const handleSearch = () => {
    if (!selectedStoreId) {
      toast.error("가게를 선택하세요.");
      return;
    }
    startTransition(async () => {
      const result = await fetchCouponsByStore({ store_id: selectedStoreId });
      if (!result.ok) {
        toast.error(result.error.message ?? "조회 실패");
        return;
      }
      setCoupons(result.data as CouponRow[]);
      setActiveCouponId(null);
      setTabData(EMPTY_TAB_DATA);
    });
  };

  const handleReset = () => {
    setSelectedStoreId(stores[0]?.store_id ?? "");
    router.refresh();
  };

  // ─── Panel 1: 행 클릭 → Panel 2 탭 로드 ─────────────────────────────────

  const handleRowClick = useCallback(
    async (row: CouponRow) => {
      if (row.coupon_id === activeCouponId) return;
      setActiveCouponId(row.coupon_id);
      setTabLoading(true);
      setTabData(EMPTY_TAB_DATA);

      const result = await fetchCouponTabs({ coupon_id: row.coupon_id });
      setTabLoading(false);
      if (!result.ok) {
        toast.error("탭 데이터 로딩 실패");
        return;
      }
      setTabData(result.data as CouponTabData);
    },
    [activeCouponId]
  );

  // ─── Panel 1: 등록/수정/삭제 ─────────────────────────────────────────────

  const handleCouponSuccess = (row: CouponRow) => {
    if (editCoupon) {
      setCoupons((prev) => prev.map((c) => (c.coupon_id === row.coupon_id ? row : c)));
    } else {
      setCoupons((prev) => [row, ...prev]);
    }
    setEditCoupon(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await softDeleteCoupon({ coupon_id: deleteTarget.coupon_id });
    if (!result.ok) {
      toast.error(result.error.message ?? "삭제 실패");
      setDeleteTarget(null);
      return;
    }
    toast.success("쿠폰이 삭제(취소 처리)되었습니다.");
    setCoupons((prev) => prev.filter((c) => c.coupon_id !== deleteTarget.coupon_id));
    if (activeCouponId === deleteTarget.coupon_id) {
      setActiveCouponId(null);
      setTabData(EMPTY_TAB_DATA);
    }
    setDeleteTarget(null);
  };

  // ─── Panel 2 탭 데이터 변경 ──────────────────────────────────────────────

  const handleTabDataChange = useCallback((partial: Partial<CouponTabData>) => {
    setTabData((prev) => ({ ...prev, ...partial }));
  }, []);

  // ─── 컬럼 정의 ───────────────────────────────────────────────────────────

  const columns: DataTableColumn<CouponRow>[] = [
    {
      key: "code",
      header: "코드",
      className: "w-28 truncate text-xs text-muted-foreground",
    },
    { key: "name", header: "쿠폰명" },
    {
      key: "coupon_type",
      header: "유형",
      render: (row) => COUPON_TYPE_LABELS[row.coupon_type] ?? row.coupon_type,
    },
    {
      key: "discount_value",
      header: "할인",
      render: (row) =>
        row.coupon_type === "SHIPPING_FREE"
          ? "무료배송"
          : row.discount_unit === "PCT"
            ? `${row.discount_value}%`
            : `${row.discount_value.toLocaleString()}원`,
    },
    {
      key: "min_order_amount",
      header: "최소주문",
      render: (row) => (row.min_order_amount ? `${row.min_order_amount.toLocaleString()}원` : "-"),
    },
    {
      key: "valid_to",
      header: "만료일",
      render: (row) => row.valid_to?.slice(0, 10) ?? "-",
    },
    {
      key: "status",
      header: "상태",
      render: (row) => {
        const cfg = COUPON_STATUS_CONFIG[row.status ?? ""] ?? {
          label: row.status,
          className: "",
        };
        return (
          <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>
            {cfg.label}
          </Badge>
        );
      },
    },
  ];

  const activeCoupon = coupons.find((c) => c.coupon_id === activeCouponId) ?? null;

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
        {/* Panel 1: 쿠폰 목록 */}
        <div className="min-h-0 overflow-auto p-4" style={{ flex: "0 0 auto", maxHeight: "40vh" }}>
          <DataTable
            columns={columns}
            data={coupons}
            rowKey={(row) => row.coupon_id}
            activeRowKey={activeCouponId ?? undefined}
            onRowClick={handleRowClick}
            searchPlaceholder="코드·쿠폰명 검색"
            toolbarActions={
              <Button
                size="sm"
                onClick={() => {
                  setEditCoupon(null);
                  setRegisterOpen(true);
                }}
                disabled={!selectedStoreId}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                쿠폰 등록
              </Button>
            }
            showRowActions
            onRowEdit={(row) => {
              setEditCoupon(row);
              setRegisterOpen(true);
            }}
            onRowDelete={(row) => setDeleteTarget(row)}
            emptyMessage="조회 조건을 설정하고 조회 버튼을 클릭하세요."
          />
        </div>

        {/* Panel 2: 탭 (쿠폰 선택 시 표시) */}
        <div className="min-h-0 flex-1 overflow-auto">
          {activeCouponId ? (
            tabLoading ? (
              <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
                탭 데이터 로딩 중...
              </div>
            ) : (
              <CouponTabs
                couponId={activeCouponId}
                couponName={activeCoupon?.name ?? ""}
                tabData={tabData}
                onTabDataChange={handleTabDataChange}
              />
            )
          ) : (
            <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
              쿠폰을 선택하면 발급·사용 현황을 관리할 수 있습니다.
            </div>
          )}
        </div>
      </div>

      {/* 등록/수정 다이얼로그 */}
      <CouponRegisterDialog
        open={registerOpen}
        onOpenChange={(open) => {
          setRegisterOpen(open);
          if (!open) setEditCoupon(null);
        }}
        storeId={selectedStoreId}
        editTarget={editCoupon}
        onSuccess={handleCouponSuccess}
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="쿠폰 삭제"
        description={`'${deleteTarget?.name}' 쿠폰을 삭제(취소 처리)하시겠습니까?`}
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
