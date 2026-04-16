"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
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
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { LayerDialog } from "@/components/admin/layer-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { createSeller, updateSeller, deleteSeller } from "@/lib/actions/domain/seller.actions";
import type { SellerRow } from "@/lib/types/domain/store";

const sellerFormSchema = z.object({
  email: z.string().email("올바른 이메일을 입력하세요"),
  name: z.string().min(1, "이름을 입력하세요"),
  phone: z.string().optional(),
  role: z.enum(["OWNER", "MANAGER", "PICKER", "PACKER"]),
  is_active: z.enum(["ACTIVE", "INACTIVE"]),
});

type SellerFormValues = z.infer<typeof sellerFormSchema>;

interface SellersTabProps {
  storeId: string;
  sellers: SellerRow[];
  onDataChange: (data: SellerRow[]) => void;
}

export function SellersTab({ storeId, sellers, onDataChange }: SellersTabProps) {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SellerRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SellerRow | null>(null);

  const form = useForm<SellerFormValues>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: { email: "", name: "", phone: "", role: "MANAGER", is_active: "ACTIVE" },
  });

  const columns: DataTableColumn<SellerRow>[] = [
    { key: "name", header: "이름" },
    { key: "email", header: "이메일" },
    { key: "phone", header: "전화번호", render: (row) => row.phone ?? "-" },
    { key: "role", header: "역할" },
    {
      key: "is_active",
      header: "상태",
      render: (row) => (
        <Badge
          variant="outline"
          className={
            row.is_active === "ACTIVE"
              ? "border-primary/30 bg-primary-light text-primary"
              : "text-text-placeholder"
          }
        >
          {row.is_active === "ACTIVE" ? "활성" : "비활성"}
        </Badge>
      ),
    },
  ];

  const openRegister = () => {
    form.reset({ email: "", name: "", phone: "", role: "MANAGER", is_active: "ACTIVE" });
    setRegisterOpen(true);
  };

  const openEdit = (row: SellerRow) => {
    form.reset({
      email: row.email ?? "",
      name: row.name ?? "",
      phone: row.phone ?? "",
      role: row.role as "OWNER" | "MANAGER" | "PICKER" | "PACKER",
      is_active: (row.is_active as "ACTIVE" | "INACTIVE") ?? "ACTIVE",
    });
    setEditTarget(row);
  };

  const handleSubmit = async (values: SellerFormValues) => {
    if (editTarget) {
      const result = await updateSeller({ seller_id: editTarget.seller_id, ...values });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("판매원 정보가 수정되었습니다.");
      onDataChange(
        sellers.map((s) => (s.seller_id === editTarget.seller_id ? (result.data as SellerRow) : s))
      );
      setEditTarget(null);
    } else {
      const result = await createSeller({ store_id: storeId, ...values });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("판매원이 추가되었습니다.");
      onDataChange([...sellers, result.data as SellerRow]);
      setRegisterOpen(false);
    }
    form.reset();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteSeller({ seller_id: deleteTarget.seller_id });
    if (!result.ok) {
      toast.error(result.error.message);
      setDeleteTarget(null);
      return;
    }
    toast.success("판매원이 삭제되었습니다.");
    onDataChange(sellers.filter((s) => s.seller_id !== deleteTarget.seller_id));
    setDeleteTarget(null);
  };

  const isDialogOpen = registerOpen || editTarget !== null;

  return (
    <div>
      <DataTable
        columns={columns}
        data={sellers}
        rowKey={(row) => row.seller_id}
        toolbarActions={
          <Button size="sm" variant="outline-gray" onClick={openRegister}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            추가
          </Button>
        }
        showRowActions
        onRowEdit={openEdit}
        onRowDelete={(row) => setDeleteTarget(row)}
        emptyMessage="판매원이 없습니다."
      />

      <LayerDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRegisterOpen(false);
            setEditTarget(null);
          }
        }}
        title={editTarget ? "판매원 수정" : "판매원 추가"}
        onConfirm={form.handleSubmit(handleSubmit)}
        confirmLabel={editTarget ? "수정" : "추가"}
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름 *</FormLabel>
                  <FormControl>
                    <Input placeholder="판매원 이름" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일 *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
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
                  <FormLabel>전화번호</FormLabel>
                  <FormControl>
                    <Input placeholder="010-0000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>역할 *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="OWNER">점주</SelectItem>
                      <SelectItem value="MANAGER">매니저</SelectItem>
                      <SelectItem value="PICKER">피커</SelectItem>
                      <SelectItem value="PACKER">패커</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
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
                      <SelectItem value="ACTIVE">활성</SelectItem>
                      <SelectItem value="INACTIVE">비활성</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </LayerDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="판매원 삭제"
        description={`'${deleteTarget?.name}' 판매원을 삭제하시겠습니까?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
