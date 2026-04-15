"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import { MOCK_COUPONS } from "@/lib/mocks/coupon";
import type { CouponRow } from "@/lib/types/domain/promotion";
import { Plus } from "lucide-react";

const couponFormSchema = z.object({
  code: z.string().min(1, "쿠폰 코드를 입력하세요"),
  name: z.string().min(1, "쿠폰명을 입력하세요"),
  coupon_type: z.string().min(1, "유형을 선택하세요"),
  discount_unit: z.enum(["PCT", "FIXED"]),
  discount_value: z.number().min(0),
  min_order_amount: z.number().min(0),
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

export function CouponsClient() {
  const [registerOpen, setRegisterOpen] = useState(false);

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: "",
      name: "",
      coupon_type: "",
      discount_unit: "PCT",
      discount_value: 0,
      min_order_amount: 0,
    },
  });

  const handleSubmit = (values: CouponFormValues) => {
    console.log("쿠폰 저장:", values);
    toast.success("쿠폰이 등록되었습니다.");
    setRegisterOpen(false);
    form.reset();
  };

  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={MOCK_COUPONS}
        rowKey={(row) => row.coupon_id}
        searchPlaceholder="코드·쿠폰명 검색"
        toolbarActions={
          <Button size="sm" onClick={() => setRegisterOpen(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            쿠폰 등록
          </Button>
        }
        showRowActions={false}
      />

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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>쿠폰 코드 *</FormLabel>
                  <FormControl>
                    <Input placeholder="SPRING10" {...field} />
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
          </form>
        </Form>
      </LayerDialog>
    </div>
  );
}
