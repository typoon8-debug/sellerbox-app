"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LayerDialog } from "@/components/admin/layer-dialog";
import { createStore } from "@/lib/actions/domain/store.actions";
import type { StoreRow, TenantRow } from "@/lib/types/domain/store";

const storeRegisterFormSchema = z.object({
  name: z.string().min(1, "가게명을 입력하세요"),
  store_category: z.string().min(1, "가게유형을 입력하세요"),
  address: z.string().min(1, "주소를 입력하세요"),
  phone: z.string().min(1, "전화번호를 입력하세요"),
  status: z.enum(["ACTIVE", "INACTIVE", "CLOSED", "PENDING"]),
});

type StoreRegisterFormValues = z.infer<typeof storeRegisterFormSchema>;

interface StoreRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: TenantRow;
  onStoreCreated: (store: StoreRow) => void;
}

export function StoreRegisterDialog({
  open,
  onOpenChange,
  tenant,
  onStoreCreated,
}: StoreRegisterDialogProps) {
  const form = useForm<StoreRegisterFormValues>({
    resolver: zodResolver(storeRegisterFormSchema),
    defaultValues: {
      name: "",
      store_category: "GENERAL",
      address: "",
      phone: "",
      status: "ACTIVE",
    },
  });

  const handleSubmit = async (values: StoreRegisterFormValues) => {
    const result = await createStore({
      tenant_id: tenant.tenant_id,
      name: values.name,
      store_category: values.store_category,
      address: values.address,
      phone: values.phone,
      min_delivery_price: 0,
      delivery_tip: 0,
      reg_number: "-",
      jumin_number: "-",
      ceo_name: "-",
      fee: 0,
      contract_start_at: new Date().toISOString().slice(0, 10),
      contract_end_at: new Date().toISOString().slice(0, 10),
      status: values.status,
    });

    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }

    toast.success("가게가 등록되었습니다.");
    form.reset();
    onStoreCreated(result.data as StoreRow);
    onOpenChange(false);
  };

  return (
    <LayerDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) form.reset();
        onOpenChange(o);
      }}
      title="가게 등록"
      size="md"
      onConfirm={form.handleSubmit(handleSubmit)}
      confirmLabel="등록"
    >
      <Form {...form}>
        <form className="space-y-4 p-4">
          <div>
            <label className="text-text-body mb-1 block text-sm font-medium">테넌트</label>
            <Input value={`${tenant.name} (${tenant.tenant_id})`} readOnly className="bg-panel" />
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>가게명 *</FormLabel>
                <FormControl>
                  <Input placeholder="가게명을 입력하세요" {...field} />
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
                <FormLabel>가게유형 *</FormLabel>
                <FormControl>
                  <Input placeholder="예: 슈퍼, 편의점" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>주소 *</FormLabel>
                <FormControl>
                  <Input placeholder="주소를 입력하세요" {...field} />
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
                <FormLabel>전화번호 *</FormLabel>
                <FormControl>
                  <Input placeholder="전화번호를 입력하세요" {...field} />
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
                <FormLabel>상태</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="상태 선택" />
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
        </form>
      </Form>
    </LayerDialog>
  );
}
