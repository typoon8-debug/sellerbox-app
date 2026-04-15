"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { createStore, updateStore, deleteStore } from "@/lib/actions/domain/store.actions";
import type { StoreRow } from "@/lib/types/domain/store";
import type { StoreStatus } from "@/lib/types/domain/enums";
import type { PaginatedResult } from "@/lib/types/api";
import { Plus } from "lucide-react";

// UI 전용 로컬 Zod 스키마 (Server Action 스키마와 역할이 다름)
const storeFormSchema = z.object({
  name: z.string().min(1, "가게명을 입력하세요"),
  address: z.string().min(1, "주소를 입력하세요"),
  phone: z.string().min(1, "전화번호를 입력하세요"),
  status: z.enum(["ACTIVE", "INACTIVE", "CLOSED", "PENDING"]),
});

type StoreFormValues = z.infer<typeof storeFormSchema>;

const columns: DataTableColumn<StoreRow>[] = [
  { key: "store_id", header: "가게 ID", className: "w-28" },
  { key: "name", header: "가게명" },
  {
    key: "status",
    header: "상태",
    render: (row) => <DomainBadge type="store" status={row.status ?? ""} />,
  },
  { key: "address", header: "주소" },
  { key: "phone", header: "전화번호" },
  {
    key: "created_at",
    header: "등록일",
    render: (row) => row.created_at?.slice(0, 10) ?? "-",
  },
];

interface StoresClientProps {
  initialData: PaginatedResult<StoreRow>;
}

export function StoresClient({ initialData }: StoresClientProps) {
  const router = useRouter();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StoreRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StoreRow | null>(null);

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      status: "ACTIVE",
    },
  });

  const openRegister = () => {
    form.reset({ name: "", address: "", phone: "", status: "ACTIVE" });
    setRegisterOpen(true);
  };

  const openEdit = (row: StoreRow) => {
    form.reset({
      name: row.name ?? "",
      address: row.address ?? "",
      phone: row.phone ?? "",
      status: (row.status as StoreStatus) ?? "ACTIVE",
    });
    setEditTarget(row);
  };

  const handleSubmit = async (values: StoreFormValues) => {
    if (editTarget) {
      // 가게 수정
      const result = await updateStore({
        store_id: editTarget.store_id,
        name: values.name,
        address: values.address,
        phone: values.phone,
        status: values.status,
      });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("가게 정보가 수정되었습니다.");
      setEditTarget(null);
    } else {
      // 가게 등록 — 필수 필드(tenant_id 등)를 포함한 별도 플로우가 필요하므로
      // 여기서는 기본값을 임시로 사용 (실제 구현에서는 테넌트 ID를 컨텍스트에서 조회)
      const result = await createStore({
        tenant_id: "00000000-0000-0000-0000-000000000000",
        name: values.name,
        store_category: "GENERAL",
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
      setRegisterOpen(false);
    }
    form.reset();
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteStore({ store_id: deleteTarget.store_id });
    if (!result.ok) {
      toast.error(result.error.message);
      setDeleteTarget(null);
      return;
    }
    toast.success(`'${deleteTarget.name}' 가게가 삭제되었습니다.`);
    setDeleteTarget(null);
    router.refresh();
  };

  const isDialogOpen = registerOpen || editTarget !== null;
  const dialogTitle = editTarget ? "가게 정보 수정" : "가게 등록";

  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={initialData.data}
        rowKey={(row) => row.store_id}
        searchPlaceholder="가게명·주소 검색"
        toolbarActions={
          <Button size="sm" onClick={openRegister}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            가게 등록
          </Button>
        }
        onRowEdit={openEdit}
        onRowDelete={(row) => setDeleteTarget(row)}
      />

      {/* 등록/수정 다이얼로그 */}
      <LayerDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRegisterOpen(false);
            setEditTarget(null);
          }
        }}
        title={dialogTitle}
        size="md"
        onConfirm={form.handleSubmit(handleSubmit)}
        confirmLabel={editTarget ? "수정" : "등록"}
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
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

      {/* 삭제 확인 */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="가게 삭제"
        description={`'${deleteTarget?.name}' 가게를 삭제하시겠습니까?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
