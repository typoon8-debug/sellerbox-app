"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X } from "lucide-react";
import type { ReviewWithJoins } from "@/lib/types/domain/support";

const replyFormSchema = z.object({
  content: z.string().min(1, "CEO 답변 내용을 입력해 주세요."),
  status: z.enum(["VISIBLE", "HIDDEN", "DELETED"]),
});

export type ReplyFormValues = z.infer<typeof replyFormSchema>;

interface ReviewReplyPanelProps {
  review: ReviewWithJoins | null;
  onClose: () => void;
  onSave: (values: ReplyFormValues) => void;
  loading?: boolean;
}

export function ReviewReplyPanel({
  review,
  onClose,
  onSave,
  loading = false,
}: ReviewReplyPanelProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReplyFormValues>({
    resolver: zodResolver(replyFormSchema),
    defaultValues: { content: "", status: "VISIBLE" },
  });

  useEffect(() => {
    if (review) {
      reset({
        content: review.ceo_review?.content ?? "",
        status: (review.ceo_review?.status as "VISIBLE" | "HIDDEN" | "DELETED") ?? "VISIBLE",
      });
    } else {
      reset({ content: "", status: "VISIBLE" });
    }
  }, [review, reset]);

  const statusValue = watch("status");

  if (!review) {
    return (
      <div className="flex h-full min-h-32 items-center justify-center rounded-md border border-dashed text-sm text-gray-400">
        리뷰를 선택하면 CEO 답변 입력 영역이 표시됩니다.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-3 rounded-md border p-4">
      <p className="text-sm font-semibold text-gray-700">
        CEO 리뷰
        {review.ceo_review && (
          <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
            답변완료
          </span>
        )}
      </p>

      <div className="flex flex-col gap-1">
        <Label htmlFor="ceo_content" className="text-xs text-gray-500">
          CEO답변 <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="ceo_content"
          {...register("content")}
          rows={7}
          placeholder="고객 리뷰에 대한 사장님 답변을 입력해 주세요."
          className="resize-none text-sm"
        />
        {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs text-gray-500">
          상태 <span className="text-red-500">*</span>
        </Label>
        <Select
          value={statusValue}
          onValueChange={(val) =>
            setValue("status", val as "VISIBLE" | "HIDDEN" | "DELETED", {
              shouldDirty: true,
            })
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="VISIBLE">공개</SelectItem>
            <SelectItem value="HIDDEN">숨김</SelectItem>
            <SelectItem value="DELETED">삭제</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-auto flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={loading}
          className="gap-1"
        >
          <X className="h-4 w-4" />
          닫기
        </Button>
        <Button type="submit" size="sm" disabled={loading} className="gap-1">
          <Save className="h-4 w-4" />
          저장
        </Button>
      </div>
    </form>
  );
}
