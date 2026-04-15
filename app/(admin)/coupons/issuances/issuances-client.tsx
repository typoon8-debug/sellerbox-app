"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { issueCoupon } from "@/lib/actions/domain/coupon.actions";
import { toastResult } from "@/lib/utils/toast-result";
import type {
  CouponIssuanceRow,
  CouponRedemptionRow,
  CouponRow,
} from "@/lib/types/domain/promotion";
import { Plus } from "lucide-react";

// 발급 상태 배지 설정
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ISSUED: { label: "발급", className: "bg-primary-light text-primary border-primary/30" },
  USED: { label: "사용", className: "bg-blue-50 text-blue-700 border-blue-200" },
  EXPIRED: { label: "만료", className: "bg-disabled text-text-placeholder border-separator" },
  CANCELLED: { label: "취소", className: "bg-alert-red-bg text-alert-red border-alert-red/30" },
};

const issuanceColumns: DataTableColumn<CouponIssuanceRow>[] = [
  { key: "issuance_id", header: "발급 ID", className: "w-28" },
  { key: "coupon_id", header: "쿠폰 ID" },
  { key: "customer_id", header: "고객 ID", render: (row) => row.customer_id ?? "(전체)" },
  {
    key: "issued_status",
    header: "상태",
    render: (row) => {
      const cfg = STATUS_CONFIG[row.issued_status ?? ""] ?? {
        label: row.issued_status ?? "-",
        className: "bg-disabled text-text-placeholder border-separator",
      };
      return (
        <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>
          {cfg.label}
        </Badge>
      );
    },
  },
  {
    key: "issued_at",
    header: "발급일시",
    render: (row) => row.issued_at?.slice(0, 16).replace("T", " ") ?? "-",
  },
  {
    key: "expires_at",
    header: "만료일",
    render: (row) => row.expires_at?.slice(0, 10) ?? "-",
  },
];

// 사용 이력 상태 배지 설정
const REDEMPTION_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  APPLIED: { label: "적용", className: "bg-primary-light text-primary border-primary/30" },
  REVOKED: { label: "취소", className: "bg-alert-red-bg text-alert-red border-alert-red/30" },
  FAILED: { label: "실패", className: "bg-disabled text-text-placeholder border-separator" },
};

const redemptionColumns: DataTableColumn<CouponRedemptionRow>[] = [
  { key: "redemption_id", header: "사용 ID", className: "w-28" },
  { key: "issuance_id", header: "발급 ID" },
  { key: "order_id", header: "주문 ID" },
  {
    key: "status",
    header: "상태",
    render: (row) => {
      const cfg = REDEMPTION_STATUS_CONFIG[row.status ?? ""] ?? {
        label: row.status ?? "-",
        className: "bg-disabled text-text-placeholder border-separator",
      };
      return (
        <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>
          {cfg.label}
        </Badge>
      );
    },
  },
  {
    key: "discount_amount",
    header: "할인 금액",
    render: (row) => `${row.discount_amount.toLocaleString()}원`,
  },
  {
    key: "used_at",
    header: "사용일시",
    render: (row) => row.used_at?.slice(0, 16).replace("T", " ") ?? "-",
  },
];

interface IssuancesClientProps {
  initialIssuances: CouponIssuanceRow[];
  initialRedemptions: CouponRedemptionRow[];
  coupons: CouponRow[];
}

export function IssuancesClient({
  initialIssuances,
  initialRedemptions,
  coupons,
}: IssuancesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [issueOpen, setIssueOpen] = useState(false);

  // 발급 폼 상태
  const [selectedCouponId, setSelectedCouponId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // 쿠폰 발급 처리
  const handleIssue = async () => {
    if (!selectedCouponId) return;

    const result = await issueCoupon({
      coupon_id: selectedCouponId,
      customer_id: customerId || null,
      expires_at: expiresAt || null,
    });
    const ok = toastResult(result, { successMessage: "쿠폰이 발급되었습니다." });
    if (ok) {
      setIssueOpen(false);
      setSelectedCouponId("");
      setCustomerId("");
      setExpiresAt("");
      startTransition(() => router.refresh());
    }
  };

  return (
    <div className="p-6">
      <Tabs defaultValue="issuances">
        <div className="mb-4 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="issuances">발급 목록</TabsTrigger>
            <TabsTrigger value="redemptions">사용 이력</TabsTrigger>
          </TabsList>
          <Button size="sm" onClick={() => setIssueOpen(true)} disabled={isPending}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            쿠폰 발급
          </Button>
        </div>

        {/* 발급 목록 탭 */}
        <TabsContent value="issuances">
          <DataTable
            columns={issuanceColumns}
            data={initialIssuances}
            rowKey={(row) => row.issuance_id}
            searchPlaceholder="발급ID·고객ID 검색"
            showRowActions={false}
            emptyMessage="발급 이력이 없습니다."
          />
        </TabsContent>

        {/* 사용 이력 탭 */}
        <TabsContent value="redemptions">
          <DataTable
            columns={redemptionColumns}
            data={initialRedemptions}
            rowKey={(row) => row.redemption_id}
            searchPlaceholder="사용ID·주문ID 검색"
            showRowActions={false}
            emptyMessage="사용 이력이 없습니다."
          />
        </TabsContent>
      </Tabs>

      {/* 쿠폰 발급 다이얼로그 */}
      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>쿠폰 발급</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="coupon-select">쿠폰 선택 *</Label>
              <Select value={selectedCouponId} onValueChange={setSelectedCouponId}>
                <SelectTrigger id="coupon-select">
                  <SelectValue placeholder="쿠폰 선택" />
                </SelectTrigger>
                <SelectContent>
                  {coupons.map((coupon) => (
                    <SelectItem key={coupon.coupon_id} value={coupon.coupon_id}>
                      {coupon.name} ({coupon.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-id">고객 ID (비워두면 전체 발급)</Label>
              <Input
                id="customer-id"
                placeholder="고객 UUID (선택)"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires-at">만료일 (선택)</Label>
              <Input
                id="expires-at"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueOpen(false)}>
              취소
            </Button>
            <Button onClick={handleIssue} disabled={isPending || !selectedCouponId}>
              {isPending ? "발급 중..." : "발급"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
