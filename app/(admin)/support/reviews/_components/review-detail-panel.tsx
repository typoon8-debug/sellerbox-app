"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewWithJoins } from "@/lib/types/domain/support";

interface ReviewDetailPanelProps {
  review: ReviewWithJoins | null;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
      <span className="ml-2 text-sm font-semibold text-gray-700">{rating}</span>
    </div>
  );
}

export function ReviewDetailPanel({ review }: ReviewDetailPanelProps) {
  if (!review) {
    return (
      <div className="flex h-full min-h-32 items-center justify-center rounded-md border border-dashed text-sm text-gray-400">
        리뷰를 선택해 주세요.
      </div>
    );
  }

  return (
    <div className="rounded-md border p-4">
      <p className="mb-3 text-sm font-semibold text-gray-700">고객 리뷰 상세</p>
      <div className="space-y-3 text-sm">
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-gray-500">회원</span>
          <span>{review.customer?.email ?? review.customer_id.slice(0, 12)}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-gray-500">상품명</span>
          <span>{review.item?.name ?? review.item_id?.slice(0, 12) ?? "-"}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-gray-500">별점</span>
          <StarRating rating={review.rating} />
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-gray-500">내용</span>
          <span className="leading-relaxed whitespace-pre-wrap">{review.content ?? "-"}</span>
        </div>

        {/* 리뷰 사진 */}
        {review.review_picture_url && (
          <div className="flex gap-2">
            <span className="w-20 shrink-0 text-gray-500">리뷰사진</span>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={review.review_picture_url}
                alt="리뷰사진"
                className="max-h-40 max-w-full rounded-md object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
              <p className="mt-1 text-xs break-all text-gray-400">{review.review_picture_url}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
