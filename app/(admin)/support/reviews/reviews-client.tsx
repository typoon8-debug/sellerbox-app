"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { createCeoReview, updateCeoReview } from "@/lib/actions/domain/support.actions";
import { Star, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaginatedResult } from "@/lib/types/api";
import type { ReviewWithCeo } from "@/app/(admin)/support/reviews/page";

// 별점 렌더링 컴포넌트
function StarRating({ rating }: { rating: number | null }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < (rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-disabled"
          )}
        />
      ))}
      <span className="text-text-placeholder ml-1 text-xs">{rating ?? "-"}</span>
    </div>
  );
}

interface ReviewsClientProps {
  initialData: PaginatedResult<ReviewWithCeo>;
  initialStatus: string;
}

export function ReviewsClient({ initialData, initialStatus }: ReviewsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    initialData.data.forEach((r) => {
      init[r.review_id] = r.ceoReview?.content ?? "";
    });
    return init;
  });

  // 상태 필터 변경 시 URL 파라미터 업데이트 → 서버 재조회
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    startTransition(() => {
      const params = new URLSearchParams();
      if (value !== "ALL") params.set("status", value);
      router.push(`?${params.toString()}`);
    });
  };

  // CEO 답변 저장 (신규 등록 또는 수정)
  const handleSaveReply = async (review: ReviewWithCeo) => {
    const content = replyTexts[review.review_id] ?? "";
    if (!content.trim()) {
      toast.error("답변 내용을 입력하세요.");
      return;
    }

    if (review.ceoReview) {
      // 기존 답변 수정 - modified_at 갱신
      const result = await updateCeoReview({
        ceo_reviewId: review.ceoReview.ceo_reviewId,
        content,
      });
      if (result.ok) {
        toast.success("CEO 답변이 수정되었습니다.");
        setExpandedId(null);
        router.refresh();
      } else {
        toast.error(result.error.message ?? "수정 중 오류가 발생했습니다.");
      }
    } else {
      // 신규 답변 등록 - ceo_review 테이블 INSERT
      const result = await createCeoReview({
        reviewId: review.review_id,
        content,
        status: "VISIBLE",
      });
      if (result.ok) {
        toast.success("CEO 답변이 등록되었습니다.");
        setExpandedId(null);
        router.refresh();
      } else {
        toast.error(result.error.message ?? "등록 중 오류가 발생했습니다.");
      }
    }
  };

  const columns: DataTableColumn<ReviewWithCeo>[] = [
    { key: "review_id", header: "리뷰 ID", className: "w-28" },
    { key: "customer_id", header: "고객 ID" },
    {
      key: "rating",
      header: "별점",
      render: (row) => <StarRating rating={row.rating} />,
    },
    {
      key: "content",
      header: "내용",
      render: (row) => (
        <span className="block max-w-xs truncate text-sm">{row.content ?? "-"}</span>
      ),
    },
    {
      key: "status",
      header: "상태",
      render: (row) => <DomainBadge type="review" status={row.status ?? ""} />,
    },
    {
      key: "ceoReview",
      header: "CEO 답변",
      render: (row) => (
        <span className={cn("text-xs", row.ceoReview ? "text-primary" : "text-text-placeholder")}>
          {row.ceoReview ? "답변 완료" : "미답변"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "작성일",
      render: (row) => row.created_at?.slice(0, 10) ?? "-",
    },
  ];

  return (
    <div className="space-y-4 p-6">
      {/* 필터 */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={handleStatusFilter} disabled={isPending}>
          <SelectTrigger className="h-8 w-36">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 상태</SelectItem>
            <SelectItem value="VISIBLE">공개</SelectItem>
            <SelectItem value="HIDDEN">숨김</SelectItem>
            <SelectItem value="REPORTED">신고</SelectItem>
            <SelectItem value="DELETED">삭제</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={initialData.data}
        rowKey={(row) => row.review_id}
        searchPlaceholder="리뷰ID·고객ID 검색"
        onRowClick={(row) =>
          setExpandedId((prev) => (prev === row.review_id ? null : row.review_id))
        }
        showRowActions={false}
        emptyMessage="리뷰가 없습니다."
      />

      {/* CEO 답변 인라인 확장 패널 */}
      {expandedId && (
        <div className="border-separator bg-panel space-y-3 rounded-lg border p-4">
          {(() => {
            const review = initialData.data.find((r) => r.review_id === expandedId);
            if (!review) return null;
            return (
              <>
                <div className="flex items-center gap-2">
                  <MessageSquare className="text-primary h-4 w-4" />
                  <span className="text-sm font-medium">
                    {review.ceoReview ? "CEO 답변 수정" : "CEO 답변 입력"}
                  </span>
                  <span className="text-text-placeholder text-xs">
                    — 리뷰 ID: {review.review_id}
                  </span>
                </div>
                <div className="bg-panel border-separator text-text-placeholder rounded border p-3 text-sm leading-relaxed">
                  {review.content}
                </div>
                {review.ceoReview && (
                  <p className="text-text-placeholder text-xs">
                    최종 수정: {review.ceoReview.modified_at?.slice(0, 16).replace("T", " ") ?? "-"}
                  </p>
                )}
                <Textarea
                  value={replyTexts[expandedId] ?? ""}
                  onChange={(e) =>
                    setReplyTexts((prev) => ({ ...prev, [expandedId]: e.target.value }))
                  }
                  placeholder="고객에게 보여질 CEO 답변을 입력하세요"
                  rows={4}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline-gray" size="sm" onClick={() => setExpandedId(null)}>
                    닫기
                  </Button>
                  <Button size="sm" onClick={() => handleSaveReply(review)}>
                    {review.ceoReview ? "수정 저장" : "답변 등록"}
                  </Button>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
