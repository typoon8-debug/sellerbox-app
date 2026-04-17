"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QueryField } from "@/components/admin/query-field";
import { QueryActions } from "@/components/admin/query-actions";
import { DateRangePicker } from "@/components/admin/domain/date-range-picker";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ReviewTable } from "@/app/(admin)/support/reviews/_components/review-table";
import { ReviewDetailPanel } from "@/app/(admin)/support/reviews/_components/review-detail-panel";
import { ReviewReplyPanel } from "@/app/(admin)/support/reviews/_components/review-reply-panel";
import type { ReplyFormValues } from "@/app/(admin)/support/reviews/_components/review-reply-panel";
import {
  fetchReviewsByStore,
  createCeoReview,
  updateCeoReview,
} from "@/lib/actions/domain/support.actions";
import type { ReviewWithJoins, CeoReviewRow } from "@/lib/types/domain/support";

interface ReviewsClientProps {
  stores: { store_id: string; name: string }[];
  initialReviews: ReviewWithJoins[];
  initialFrom: string;
  initialTo: string;
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toDateStr(date: Date | undefined, fallback: string): string {
  if (!date) return fallback;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function ReviewsClient({
  stores,
  initialReviews,
  initialFrom,
  initialTo,
}: ReviewsClientProps) {
  const [isPending, startTransition] = useTransition();

  // ─── 검색 조건 ───────────────────────────────────────────────────────────────
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0]?.store_id ?? "");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(parseLocalDate(initialFrom));
  const [dateTo, setDateTo] = useState<Date | undefined>(parseLocalDate(initialTo));
  const [statusFilter, setStatusFilter] = useState<
    "VISIBLE" | "HIDDEN" | "REPORTED" | "DELETED" | "ALL"
  >("ALL");

  // ─── 데이터 ──────────────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState<ReviewWithJoins[]>(initialReviews);
  const [activeReview, setActiveReview] = useState<ReviewWithJoins | null>(null);

  // ─── 다이얼로그 ──────────────────────────────────────────────────────────────
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  // ─── 조회 ─────────────────────────────────────────────────────────────────────
  const doSearch = () => {
    if (!selectedStoreId) {
      toast.warning("가게를 선택해 주세요.");
      return;
    }
    const from = toDateStr(dateFrom, initialFrom);
    const to = toDateStr(dateTo, initialTo);

    startTransition(async () => {
      const result = await fetchReviewsByStore({
        store_id: selectedStoreId,
        from_date: from,
        to_date: to,
        status: statusFilter,
      });
      if (!result.ok) {
        toast.error(result.error?.message ?? "리뷰 목록 조회에 실패했습니다.");
        return;
      }
      setReviews((result.data as ReviewWithJoins[]) ?? []);
      setActiveReview(null);
    });
  };

  const doReset = () => {
    const today = new Date();
    setSelectedStoreId(stores[0]?.store_id ?? "");
    setDateFrom(today);
    setDateTo(today);
    setStatusFilter("ALL");
    setReviews(initialReviews);
    setActiveReview(null);
  };

  // ─── 저장 ─────────────────────────────────────────────────────────────────────
  const handleSave = (values: ReplyFormValues) => {
    if (!activeReview) return;

    startTransition(async () => {
      let savedCeoReview: CeoReviewRow;

      if (!activeReview.ceo_review) {
        // 신규 등록
        const result = await createCeoReview({
          reviewId: activeReview.review_id,
          content: values.content,
          status: values.status,
        });
        if (!result.ok) {
          toast.error(result.error?.message ?? "CEO 답변 등록에 실패했습니다.");
          return;
        }
        savedCeoReview = result.data as CeoReviewRow;
        toast.success("CEO 답변이 등록되었습니다.");
      } else {
        // 수정
        const result = await updateCeoReview({
          ceo_reviewId: activeReview.ceo_review.ceo_reviewId,
          content: values.content,
          status: values.status,
        });
        if (!result.ok) {
          toast.error(result.error?.message ?? "CEO 답변 수정에 실패했습니다.");
          return;
        }
        savedCeoReview = result.data as CeoReviewRow;
        toast.success("CEO 답변이 수정되었습니다.");
      }

      // 목록 row in-place 업데이트
      const updatedReview: ReviewWithJoins = {
        ...activeReview,
        ceo_review: savedCeoReview,
      };
      setReviews((prev) =>
        prev.map((r) => (r.review_id === activeReview.review_id ? updatedReview : r))
      );
      setActiveReview(updatedReview);
    });
  };

  // ─── 닫기 ─────────────────────────────────────────────────────────────────────
  const handleClose = () => {
    setCloseConfirmOpen(true);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
      {/* 검색 조건 */}
      <div className="bg-card flex flex-wrap items-end gap-3 rounded-lg border p-4">
        <QueryField label="가게">
          {stores.length === 0 ? (
            <span className="text-sm text-gray-400">소속 가게 없음</span>
          ) : (
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId} disabled={isPending}>
              <SelectTrigger className="w-48">
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

        <QueryField label="기간">
          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            onFromChange={setDateFrom}
            onToChange={setDateTo}
            disabled={isPending}
          />
        </QueryField>

        <QueryField label="상태">
          <Select
            value={statusFilter}
            onValueChange={(v) =>
              setStatusFilter(v as "VISIBLE" | "HIDDEN" | "REPORTED" | "DELETED" | "ALL")
            }
            disabled={isPending}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="VISIBLE">공개</SelectItem>
              <SelectItem value="HIDDEN">숨김</SelectItem>
              <SelectItem value="REPORTED">신고됨</SelectItem>
              <SelectItem value="DELETED">삭제됨</SelectItem>
            </SelectContent>
          </Select>
        </QueryField>

        <QueryActions onSearch={doSearch} onReset={doReset} loading={isPending} />
      </div>

      {/* Panel 1: 리뷰 목록 */}
      <div className="bg-card rounded-lg border p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            FP-리뷰
            <span className="ml-1 text-gray-400">({reviews.length}건)</span>
          </span>
        </div>
        <ReviewTable
          reviews={reviews}
          activeReviewId={activeReview?.review_id ?? null}
          onRowClick={setActiveReview}
          loading={isPending}
        />
      </div>

      {/* Panel 2: 리뷰 상세 + CEO 답변 */}
      <div className="bg-card grid flex-1 grid-cols-2 gap-4 rounded-lg border p-4">
        <ReviewDetailPanel review={activeReview} />
        <ReviewReplyPanel
          review={activeReview}
          onClose={handleClose}
          onSave={handleSave}
          loading={isPending}
        />
      </div>

      {/* 닫기 시 변경사항 확인 */}
      <ConfirmDialog
        open={closeConfirmOpen}
        onOpenChange={setCloseConfirmOpen}
        title="변경사항이 있습니다"
        description="저장하지 않은 변경사항이 있습니다. 정말 닫으시겠습니까?"
        confirmLabel="닫기"
        cancelLabel="취소"
        destructive={false}
        onConfirm={() => {
          setActiveReview(null);
        }}
      />
    </div>
  );
}
