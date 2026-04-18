"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import { updateStore } from "@/lib/actions/domain/store.actions";
import type { StoreRow } from "@/lib/types/domain/store";

// 가게 상세 폼 스키마 (UI 전용) — z.number() 사용, onChange에서 valueAsNumber 처리
const storeDetailFormSchema = z.object({
  name: z.string().min(1, "가게이름을 입력하세요"),
  store_category: z.string().min(1, "가게유형을 입력하세요"),
  address: z.string().min(1, "주소를 입력하세요"),
  phone: z.string().min(1, "전화번호를 입력하세요"),
  min_delivery_price: z.number().int().min(0),
  delivery_tip: z.number().int().min(0),
  min_delivery_time: z.number().int().min(0).optional(),
  max_delivery_time: z.number().int().min(0).optional(),
  operation_hours: z.string().optional(),
  closed_days: z.string().optional(),
  delivery_address: z.string().optional(),
  reg_number: z.string().optional(),
  jumin_number: z.string().optional(),
  ceo_name: z.string().optional(),
  fee: z.number().min(0),
  contract_start_at: z.string().optional(),
  contract_end_at: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "CLOSED", "PENDING"]),
  points_enabled: z.number().int().optional(),
  accrual_rate_pct: z.number().optional(),
  redeem_enabled: z.number().int().optional(),
  max_redeem_rate_pct: z.number().optional(),
  max_redeem_amount: z.number().int().optional(),
  expire_after_days: z.number().int().optional(),
  rounding_mode: z.string().optional(),
});

type StoreDetailFormValues = z.infer<typeof storeDetailFormSchema>;

// 숫자 input onChange 핸들러 — valueAsNumber 사용
function numOnChange(fieldOnChange: (v: number) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    fieldOnChange(e.target.valueAsNumber);
  };
}

// 선택적 숫자 input onChange 핸들러 (빈 값은 undefined)
function numOptOnChange(fieldOnChange: (v: number | undefined) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.valueAsNumber;
    fieldOnChange(isNaN(val) ? undefined : val);
  };
}

interface StoreDetailFormProps {
  store: StoreRow;
  onClose: () => void;
  onSaved: (store: StoreRow) => void;
}

export function StoreDetailForm({ store, onClose, onSaved }: StoreDetailFormProps) {
  const router = useRouter();

  const form = useForm<StoreDetailFormValues>({
    resolver: zodResolver(storeDetailFormSchema),
    defaultValues: getDefaultValues(store),
  });

  useEffect(() => {
    form.reset(getDefaultValues(store));
  }, [store.store_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: StoreDetailFormValues) => {
    const result = await updateStore({
      store_id: store.store_id,
      ...values,
    });
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    toast.success("가게 정보가 저장되었습니다.");
    onSaved(result.data as StoreRow);
    router.refresh();
  };

  return (
    <div className="border-separator border-b">
      <div className="border-separator bg-panel border-b px-4 py-2">
        <span className="text-text-body text-sm font-semibold">가게정보</span>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4">
          {/* 1행: 가게ID(읽기전용), 테넌트ID(읽기전용), 가게이름, 가게유형 */}
          <div className="mb-3 grid grid-cols-4 gap-3">
            <div>
              <label className="text-text-body mb-1 block text-xs font-medium">가게ID</label>
              <Input value={store.store_id} readOnly className="bg-panel text-xs" />
            </div>
            <div>
              <label className="text-text-body mb-1 block text-xs font-medium">테넌트ID</label>
              <Input value={store.tenant_id} readOnly className="bg-panel text-xs" />
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">* 가게이름</FormLabel>
                  <FormControl>
                    <Input {...field} className="text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="store_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">* 가게유형</FormLabel>
                  <FormControl>
                    <Input {...field} className="text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 2행: 주소, 전화번호, 최소주문금액, 배달팁 */}
          <div className="mb-3 grid grid-cols-4 gap-3">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">* 주소</FormLabel>
                  <FormControl>
                    <Input {...field} className="text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">* 전화번호</FormLabel>
                  <FormControl>
                    <Input {...field} className="text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="min_delivery_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">* 최소주문금액</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value}
                      onChange={numOnChange(field.onChange)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className="text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="delivery_tip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">* 배달팁</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value}
                      onChange={numOnChange(field.onChange)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className="text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 3행: 최소/최대 배달예상시간, 포인트적립, 적립비율 */}
          <div className="mb-3 grid grid-cols-4 gap-3">
            <FormField
              control={form.control}
              name="min_delivery_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">최소배달예상시간</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={numOptOnChange(field.onChange)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className="text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max_delivery_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">최대배달예상시간</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={numOptOnChange(field.onChange)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className="text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="points_enabled"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">포인트적립사용여부</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value?.toString() ?? "0"}
                  >
                    <FormControl>
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">적립</SelectItem>
                      <SelectItem value="0">미적립</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accrual_rate_pct"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">적립비율(%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      value={field.value ?? ""}
                      onChange={numOptOnChange(field.onChange)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className="text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 4행: 결제시포인트사용, 최대사용비율, 1회최대사용포인트, 적립만료일수 */}
          <div className="mb-3 grid grid-cols-4 gap-3">
            <FormField
              control={form.control}
              name="redeem_enabled"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">결제시포인트사용</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value?.toString() ?? "0"}
                  >
                    <FormControl>
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">가능</SelectItem>
                      <SelectItem value="0">불가</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max_redeem_rate_pct"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">최대사용비율(%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      value={field.value ?? ""}
                      onChange={numOptOnChange(field.onChange)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className="text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max_redeem_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">1회최대사용포인트</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={numOptOnChange(field.onChange)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className="text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expire_after_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">적립만료일수</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={numOptOnChange(field.onChange)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className="text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 5행: 운영시간, 유무일, 배달지역, 반올림정책 */}
          <div className="mb-3 grid grid-cols-4 gap-3">
            <FormField
              control={form.control}
              name="operation_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">운영시간</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="11:00 ~ 23:00"
                      className="text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="closed_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">유무일</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="매월 2,4주 수요일"
                      className="text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="delivery_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">배달지역</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} className="text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rounding_mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">반올림정책</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DOWN">DOWN</SelectItem>
                      <SelectItem value="UP">UP</SelectItem>
                      <SelectItem value="HALF_UP">HALF_UP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 6행: 사업자등록번호, 주민등록번호, 대표자이름, 수수료 */}
          <div className="mb-3 grid grid-cols-4 gap-3">
            <FormField
              control={form.control}
              name="reg_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">사업자등록번호</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} className="text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jumin_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">주민등록번호</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} className="text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ceo_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">대표자이름</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} className="text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">수수료</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      value={field.value}
                      onChange={numOnChange(field.onChange)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className="text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 7행: 계약시작일, 계약종료일, 상태 */}
          <div className="mb-4 grid grid-cols-4 gap-3">
            <FormField
              control={form.control}
              name="contract_start_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">계약시작일</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ""} className="text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contract_end_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">계약종료일</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ""} className="text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">* 상태</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">운영중</SelectItem>
                      <SelectItem value="PENDING">대기</SelectItem>
                      <SelectItem value="INACTIVE">비활성</SelectItem>
                      <SelectItem value="CLOSED">폐업</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline-gray" size="sm" onClick={onClose}>
              닫기
            </Button>
            <Button type="submit" variant="primary" size="sm">
              저장
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function getDefaultValues(store: StoreRow): StoreDetailFormValues {
  return {
    name: store.name ?? "",
    store_category: store.store_category ?? "",
    address: store.address ?? "",
    phone: store.phone ?? "",
    min_delivery_price: store.min_delivery_price ?? 0,
    delivery_tip: store.delivery_tip ?? 0,
    min_delivery_time: store.min_delivery_time ?? undefined,
    max_delivery_time: store.max_delivery_time ?? undefined,
    operation_hours: store.operation_hours ?? "",
    closed_days: store.closed_days ?? "",
    delivery_address: store.delivery_address ?? "",
    reg_number: store.reg_number ?? "",
    jumin_number: store.jumin_number ?? "",
    ceo_name: store.ceo_name ?? "",
    fee: store.fee ?? 0,
    contract_start_at: store.contract_start_at ?? "",
    contract_end_at: store.contract_end_at ?? "",
    status: (store.status as "ACTIVE" | "INACTIVE" | "CLOSED" | "PENDING") ?? "ACTIVE",
    points_enabled: store.points_enabled ?? undefined,
    accrual_rate_pct: store.accrual_rate_pct ?? undefined,
    redeem_enabled: store.redeem_enabled ?? undefined,
    max_redeem_rate_pct: store.max_redeem_rate_pct ?? undefined,
    max_redeem_amount: store.max_redeem_amount ?? undefined,
    expire_after_days: store.expire_after_days ?? undefined,
    rounding_mode: store.rounding_mode ?? "",
  };
}
