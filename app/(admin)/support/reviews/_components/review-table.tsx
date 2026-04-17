"use client";

import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewWithJoins } from "@/lib/types/domain/support";

interface ReviewTableProps {
  reviews: ReviewWithJoins[];
  activeReviewId: string | null;
  onRowClick: (review: ReviewWithJoins) => void;
  loading?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
      <span className="ml-1 text-xs text-gray-500">{rating}</span>
    </div>
  );
}

const columns: DataTableColumn<ReviewWithJoins>[] = [
  {
    key: "review_id",
    header: "리뷰ID",
    render: (row) => (
      <span className="font-mono text-xs text-gray-500">{row.review_id.slice(0, 8)}…</span>
    ),
    className: "w-28",
  },
  {
    key: "customer_id",
    header: "회원ID",
    render: (row) => (
      <span className="text-xs">{row.customer?.email ?? row.customer_id.slice(0, 10) + "…"}</span>
    ),
    className: "w-40",
  },
  {
    key: "item_id",
    header: "상품",
    render: (row) => (
      <span className="text-xs">{row.item?.name ?? row.item_id?.slice(0, 8) ?? "-"}</span>
    ),
    className: "w-32",
  },
  {
    key: "rating",
    header: "별점",
    render: (row) => <StarRating rating={row.rating} />,
    className: "w-32",
  },
  {
    key: "content",
    header: "내용",
    render: (row) => <span className="line-clamp-1 max-w-xs text-xs">{row.content ?? "-"}</span>,
  },
  {
    key: "review_picture_url",
    header: "리뷰사진",
    render: (row) =>
      row.review_picture_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={row.review_picture_url} alt="리뷰사진" className="h-8 w-8 rounded object-cover" />
      ) : (
        <span className="text-xs text-gray-300">없음</span>
      ),
    className: "w-20",
  },
  {
    key: "created_at",
    header: "생성일",
    render: (row) => <span className="text-xs">{row.created_at.slice(0, 10)}</span>,
    className: "w-24",
  },
  {
    key: "modified_at",
    header: "수정일",
    render: (row) => <span className="text-xs">{row.modified_at.slice(0, 10)}</span>,
    className: "w-24",
  },
  {
    key: "status",
    header: "상태",
    render: (row) => <DomainBadge type="review" status={row.status} />,
    className: "w-24",
  },
  {
    key: "ceo_review",
    header: "CEO답변",
    render: (row) => (
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs",
          row.ceo_review ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"
        )}
      >
        {row.ceo_review ? "답변완료" : "미답변"}
      </span>
    ),
    className: "w-24",
  },
];

export function ReviewTable({
  reviews,
  activeReviewId,
  onRowClick,
  loading = false,
}: ReviewTableProps) {
  return (
    <div className="max-h-[40vh] overflow-auto rounded-md border">
      <DataTable
        columns={columns}
        data={reviews}
        rowKey={(row) => row.review_id}
        loading={loading}
        hideSearch
        showRowActions={false}
        emptyMessage="조회된 리뷰가 없습니다."
        onRowClick={onRowClick}
        rowClassName={(row) =>
          row.review_id === activeReviewId ? "bg-blue-50 dark:bg-blue-950" : ""
        }
      />
    </div>
  );
}
