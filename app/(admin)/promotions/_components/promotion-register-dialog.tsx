"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LayerDialog } from "@/components/admin/layer-dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPromotion, updatePromotion } from "@/lib/actions/domain/promotion.actions";
import type { PromotionRow } from "@/lib/types/domain/promotion";

// ─── 폼 스키마 ────────────────────────────────────────────────────────────────

const formSchema = z.object({
  name: z.string().min(1, "프로모션명을 입력하세요"),
  type: z.enum([
    "SALE",
    "DISCOUNT_PCT",
    "DISCOUNT_FIXED",
    "ONE_PLUS_ONE",
    "TWO_PLUS_ONE",
    "BUNDLE",
  ]),
  discount_unit: z.enum(["PCT", "FIXED"]).optional().nullable(),
  discount_value: z.number().min(0).optional().nullable(),
  start_at: z.string().min(1, "시작일을 입력하세요"),
  end_at: z.string().min(1, "종료일을 입력하세요"),
  status: z.enum(["SCHEDULED", "ACTIVE", "PAUSED", "ENDED"]),
  priority: z.number().int().min(0),
  max_usage: z.number().int().min(1).optional().nullable(),
  per_user_limit: z.number().int().min(1).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface PromotionRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  editTarget: PromotionRow | null;
  onSuccess: (row: PromotionRow) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PromotionRegisterDialog({
  open,
  onOpenChange,
  storeId,
  editTarget,
  onSuccess,
}: PromotionRegisterDialogProps) {
  const isEdit = editTarget !== null;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "SALE",
      discount_unit: null,
      discount_value: null,
      start_at: "",
      end_at: "",
      status: "SCHEDULED",
      priority: 0,
      max_usage: null,
      per_user_limit: null,
    },
  });

  const promoType = form.watch("type");

  // 수정 시 기존 값 바인딩
  useEffect(() => {
    if (editTarget) {
      form.reset({
        name: editTarget.name,
        type: editTarget.type as FormValues["type"],
        discount_unit: editTarget.discount_unit as FormValues["discount_unit"],
        discount_value: editTarget.discount_value ?? null,
        start_at: editTarget.start_at?.slice(0, 10) ?? "",
        end_at: editTarget.end_at?.slice(0, 10) ?? "",
        status: editTarget.status as FormValues["status"],
        priority: editTarget.priority ?? 0,
        max_usage: editTarget.max_usage ?? null,
        per_user_limit: editTarget.per_user_limit ?? null,
      });
    } else {
      form.reset({
        name: "",
        type: "SALE",
        discount_unit: null,
        discount_value: null,
        start_at: "",
        end_at: "",
        status: "SCHEDULED",
        priority: 0,
        max_usage: null,
        per_user_limit: null,
      });
    }
  }, [editTarget, form, open]);

  const handleSubmit = async (values: FormValues) => {
    if (isEdit) {
      const result = await updatePromotion({
        promo_id: editTarget.promo_id,
        name: values.name,
        status: values.status,
        start_at: values.start_at,
        end_at: values.end_at,
        priority: values.priority,
        max_usage: values.max_usage,
        per_user_limit: values.per_user_limit,
      });
      if (!result.ok) {
        toast.error(result.error.message ?? "수정 실패");
        return;
      }
      toast.success("프로모션이 수정되었습니다.");
      onSuccess(result.data as PromotionRow);
    } else {
      const result = await createPromotion({
        store_id: storeId,
        name: values.name,
        type: values.type,
        discount_unit: values.discount_unit ?? undefined,
        discount_value: values.discount_value ?? undefined,
        start_at: values.start_at,
        end_at: values.end_at,
        status: values.status,
        priority: values.priority,
        max_usage: values.max_usage ?? undefined,
        per_user_limit: values.per_user_limit ?? undefined,
      });
      if (!result.ok) {
        toast.error(result.error.message ?? "등록 실패");
        return;
      }
      toast.success("프로모션이 등록되었습니다.");
      onSuccess(result.data as PromotionRow);
    }
    onOpenChange(false);
  };

  // 할인값 표시 조건: 퍼센트·정액 할인 유형
  const showDiscount =
    promoType === "DISCOUNT_PCT" || promoType === "DISCOUNT_FIXED" || promoType === "SALE";

  return (
    <LayerDialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) form.reset();
      }}
      title={isEdit ? "프로모션 수정" : "프로모션 등록"}
      size="md"
      onConfirm={form.handleSubmit(handleSubmit)}
      confirmLabel={isEdit ? "저장" : "등록"}
    >
      <Form {...form}>
        <form className="space-y-4 p-4">
          {/* 프로모션명 */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>프로모션명 *</FormLabel>
                <FormControl>
                  <Input placeholder="프로모션명을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 유형 (등록 시만 수정 가능) */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>유형 *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isEdit}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="유형 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SALE">세일</SelectItem>
                    <SelectItem value="DISCOUNT_PCT">% 할인</SelectItem>
                    <SelectItem value="DISCOUNT_FIXED">정액 할인</SelectItem>
                    <SelectItem value="ONE_PLUS_ONE">1+1</SelectItem>
                    <SelectItem value="TWO_PLUS_ONE">2+1</SelectItem>
                    <SelectItem value="BUNDLE">묶음</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 할인 단위 + 할인값 (할인 유형일 때) */}
          {showDiscount && (
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="discount_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>할인 단위</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                      disabled={isEdit}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="단위 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PCT">% (퍼센트)</SelectItem>
                        <SelectItem value="FIXED">원 (정액)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discount_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>할인값</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* 시작일 / 종료일 */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="start_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>시작일 *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>종료일 *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 상태 / 우선순위 */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상태</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">예약</SelectItem>
                      <SelectItem value="ACTIVE">즉시 활성화</SelectItem>
                      <SelectItem value="PAUSED">일시정지</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>우선순위</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 최대 사용 횟수 / 1인 한도 */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="max_usage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>최대 사용 횟수</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="제한 없음"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="per_user_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>1인 사용 한도</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="제한 없음"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </LayerDialog>
  );
}
