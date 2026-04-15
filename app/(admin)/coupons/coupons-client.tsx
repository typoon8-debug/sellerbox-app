"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { LayerDialog } from "@/components/admin/layer-dialog";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { PriceDisplay } from "@/components/admin/domain/price-display";
import { createCoupon } from "@/lib/actions/domain/coupon.actions";
import { toastResult } from "@/lib/utils/toast-result";
import type { CouponRow } from "@/lib/types/domain/promotion";
import { Plus } from "lucide-react";

// 쿠폰 등록 폼 스키마
const couponFormSchema = z.object({
  store_id: z.string().min(1, "가게 ID를 입력하세요"),
  name: z.string().min(1, "쿠폰명을 입력하세요"),
  coupon_type: z.enum(["DISCOUNT", "SHIPPING_FREE", "SIGNUP"] as const),
  discount_unit: z.enum(["PCT", "FIXED"] as const),
  discount_value: z.number().min(0),
  min_order_amount: z.number().min(0),
  valid_to: z.string().min(1, "만료일을 입력하세요"),
});

type CouponFormValues = z.infer<typeof couponFormSchema>;

const columns: DataTableColumn<CouponRow>[] = [
  { key: "code", header: "코드", className: "w-32" },
  { key: "name", header: "쿠폰명" },
  { key: "coupon_type", header: "유형" },
  {
    key: "discount_value",
    header: "할인",
    render: (row) =>
      row.discount_unit === "PCT" ? (
        `${row.discount_value}%`
      ) : (
        <PriceDisplay amount={row.discount_value ?? 0} />
      ),
  },
  {
    key: "status",
    header: "상태",
    render: (row) => <DomainBadge type="coupon" status={row.status ?? ""} />,
  },
  {
    key: "valid_to",
    header: "만료일",
    render: (row) => row.valid_to?.slice(0, 10) ?? "-",
  },
];

interface CouponsClientProps {
  initialData: CouponRow[];
}

export function CouponsClient({ initialData }: CouponsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [registerOpen, setRegisterOpen] = useState(false);

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      store_id: "",
      name: "",
      coupon_type: "DISCOUNT",
      discount_unit: "PCT",
      discount_value: 0,
      min_order_amount: 0,
      valid_to: "",
    },
  });

  // 쿠폰 유형 감시 (유형별 폼 분기)
  const couponType = form.watch("coupon_type");

  // 쿠폰 등록 처리
  const handleSubmit = async (values: CouponFormValues) => {
    const result = await createCoupon({
      store_id: values.store_id,
      name: values.name,
      coupon_type: values.coupon_type,
      discount_unit: values.discount_unit,
      discount_value: values.discount_value,
      min_order_amount: values.min_order_amount,
      valid_to: values.valid_to,
    });
    const ok = toastResult(result, { successMessage: "쿠폰이 등록되었습니다." });
    if (ok) {
      setRegisterOpen(false);
      form.reset();
      startTransition(() => router.refresh());
    }
  };

  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={initialData}
        rowKey={(row) => row.coupon_id}
        searchPlaceholder="코드·쿠폰명 검색"
        toolbarActions={
          <Button size="sm" onClick={() => setRegisterOpen(true)} disabled={isPending}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            쿠폰 등록
          </Button>
        }
        showRowActions={false}
      />

      {/* 쿠폰 등록 다이얼로그 */}
      <LayerDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        title="쿠폰 등록"
        size="md"
        onConfirm={form.handleSubmit(handleSubmit)}
        confirmLabel="등록"
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="store_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>가게 ID *</FormLabel>
                  <FormControl>
                    <Input placeholder="가게 UUID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

            {/* DISCOUNT/SIGNUP 유형: 할인 단위 및 할인값 */}
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

            {/* SHIPPING_FREE 유형: 무료배송 최대 금액 */}
            {couponType === "SHIPPING_FREE" && (
              <FormItem>
                <FormLabel>할인 단위 (무료배송)</FormLabel>
                <Input value="무료배송 쿠폰" disabled />
              </FormItem>
            )}

            <FormField
              control={form.control}
              name="min_order_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>최소 주문금액</FormLabel>
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
            <FormField
              control={form.control}
              name="valid_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>만료일 *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </LayerDialog>
    </div>
  );
}
