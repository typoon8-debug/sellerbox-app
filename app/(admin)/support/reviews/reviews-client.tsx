"use client";

import { useState } from "react";
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
import { MOCK_REVIEWS, type ReviewWithCeoReply } from "@/lib/mocks/support";
import { Star, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function ReviewsClient() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    MOCK_REVIEWS.forEach((r) => {
      init[r.review_id] = r.ceo_reply ?? "";
    });
    return init;
  });

  const filteredData = MOCK_REVIEWS.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    return true;
  });

  const handleSaveReply = () => {
    toast.success("CEO 답변이 저장되었습니다.");
    setExpandedId(null);
  };

  const columns: DataTableColumn<ReviewWithCeoReply>[] = [
    { key: "review_id", header: "리뷰 ID", className: "w-28" },
    { key: "customer_name", header: "고객명" },
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
      key: "ceo_reply",
      header: "CEO 답변",
      render: (row) => (
        <span className={cn("text-xs", row.ceo_reply ? "text-primary" : "text-text-placeholder")}>
          {row.ceo_reply ? "답변 완료" : "미답변"}
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
        data={filteredData}
        rowKey={(row) => row.review_id}
        searchPlaceholder="리뷰ID·고객명 검색"
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
            const review = MOCK_REVIEWS.find((r) => r.review_id === expandedId);
            if (!review) return null;
            return (
              <>
                <div className="flex items-center gap-2">
                  <MessageSquare className="text-primary h-4 w-4" />
                  <span className="text-sm font-medium">CEO 답변 입력</span>
                  <span className="text-text-placeholder text-xs">
                    — {review.customer_name}님 리뷰
                  </span>
                </div>
                <div className="bg-panel border-separator text-text-placeholder rounded border p-3 text-sm leading-relaxed">
                  {review.content}
                </div>
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
                  <Button size="sm" onClick={() => handleSaveReply()}>
                    저장
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
