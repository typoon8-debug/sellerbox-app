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
import { Switch } from "@/components/ui/switch";
import { createCoupon, updateCoupon } from "@/lib/actions/domain/coupon.actions";
import type { CouponRow } from "@/lib/types/domain/promotion";

const formSchema = z.object({
  name: z.string().min(1, "쿠폰명을 입력하세요"),
  coupon_type: z.enum(["DISCOUNT", "SHIPPING_FREE", "SIGNUP"]),
  discount_unit: z.enum(["PCT", "FIXED"]),
  discount_value: z.number().min(0),
  shipping_max_free: z.number().min(0),
  min_order_amount: z.number().min(0),
  valid_from: z.string().optional(),
  valid_to: z.string().min(1, "만료일을 입력하세요"),
  total_issuable: z.number().int().min(1),
  per_customer_limit: z.number().int().min(1),
  stackable: z.boolean(),
  status: z.enum(["ISSUED", "USED", "EXPIRED", "CANCELLED"]),
});

type FormValues = z.infer<typeof formSchema>;

interface CouponRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  editTarget: CouponRow | null;
  onSuccess: (row: CouponRow) => void;
}

export function CouponRegisterDialog({
  open,
  onOpenChange,
  storeId,
  editTarget,
  onSuccess,
}: CouponRegisterDialogProps) {
  const isEdit = editTarget !== null;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      coupon_type: "DISCOUNT",
      discount_unit: "PCT",
      discount_value: 0,
      shipping_max_free: 0,
      min_order_amount: 0,
      valid_from: "",
      valid_to: "",
      total_issuable: 100,
      per_customer_limit: 1,
      stackable: false,
      status: "ISSUED",
    },
  });

  const couponType = form.watch("coupon_type");

  // 수정 시 기존 값 바인딩
  useEffect(() => {
    if (editTarget) {
      form.reset({
        name: editTarget.name,
        coupon_type: editTarget.coupon_type as FormValues["coupon_type"],
        discount_unit: editTarget.discount_unit as FormValues["discount_unit"],
        discount_value: editTarget.discount_value,
        shipping_max_free: editTarget.shipping_max_free ?? 0,
        min_order_amount: editTarget.min_order_amount ?? 0,
        valid_from: editTarget.valid_from?.slice(0, 10) ?? "",
        valid_to: editTarget.valid_to?.slice(0, 10) ?? "",
        total_issuable: editTarget.total_issuable ?? 100,
        per_customer_limit: editTarget.per_customer_limit ?? 1,
        stackable: (editTarget.stackable ?? 0) === 1,
        status: editTarget.status as FormValues["status"],
      });
    } else {
      form.reset({
        name: "",
        coupon_type: "DISCOUNT",
        discount_unit: "PCT",
        discount_value: 0,
        shipping_max_free: 0,
        min_order_amount: 0,
        valid_from: "",
        valid_to: "",
        total_issuable: 100,
        per_customer_limit: 1,
        stackable: false,
        status: "ISSUED",
      });
    }
  }, [editTarget, form, open]);

  const handleSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      stackable: values.stackable ? 1 : 0,
      valid_from: values.valid_from || undefined,
    };

    if (isEdit) {
      const result = await updateCoupon({ coupon_id: editTarget.coupon_id, ...payload });
      if (!result.ok) {
        toast.error(result.error.message ?? "수정 실패");
        return;
      }
      toast.success("쿠폰이 수정되었습니다.");
      onSuccess(result.data as CouponRow);
    } else {
      const result = await createCoupon({ store_id: storeId, ...payload });
      if (!result.ok) {
        toast.error(result.error.message ?? "등록 실패");
        return;
      }
      toast.success("쿠폰이 등록되었습니다.");
      onSuccess(result.data as CouponRow);
    }
    onOpenChange(false);
  };

  return (
    <LayerDialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) form.reset();
      }}
      title={isEdit ? "쿠폰 수정" : "쿠폰 등록"}
      size="md"
      onConfirm={form.handleSubmit(handleSubmit)}
      confirmLabel={isEdit ? "저장" : "등록"}
    >
      <Form {...form}>
        <form className="space-y-4 p-4">
          {/* 쿠폰명 */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>쿠폰명 *</FormLabel>
                <FormControl>
                  <Input placeholder="쿠폰명을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 유형 */}
          <FormField
            control={form.control}
            name="coupon_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>유형 *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="유형 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DISCOUNT">할인</SelectItem>
                    <SelectItem value="SHIPPING_FREE">무료배송</SelectItem>
                    <SelectItem value="SIGNUP">신규가입</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 할인 단위 + 할인값 (DISCOUNT/SIGNUP) */}
          {(couponType === "DISCOUNT" || couponType === "SIGNUP") && (
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="discount_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>할인 단위</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* 무료배송 최대 금액 (SHIPPING_FREE) */}
          {couponType === "SHIPPING_FREE" && (
            <FormField
              control={form.control}
              name="shipping_max_free"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>최대 무료배송 금액 (0 = 전액)</FormLabel>
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
          )}

          {/* 최소 주문금액 */}
          <FormField
            control={form.control}
            name="min_order_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>최소 주문금액 (원)</FormLabel>
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

          {/* 발급 한도 + 1인 한도 */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="total_issuable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>총 발급 한도</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="per_customer_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>1인 발급 한도</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 유효기간 */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="valid_from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>유효 시작일</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="valid_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>유효 종료일 *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 상태 + 중복사용 */}
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
                      <SelectItem value="ISSUED">발급</SelectItem>
                      <SelectItem value="USED">사용</SelectItem>
                      <SelectItem value="EXPIRED">만료</SelectItem>
                      <SelectItem value="CANCELLED">취소</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stackable"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-end gap-2">
                  <FormLabel>중복 사용 가능</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </LayerDialog>
  );
}
