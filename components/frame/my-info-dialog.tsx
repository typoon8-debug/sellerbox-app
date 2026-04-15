"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LayerDialog } from "@/components/admin/layer-dialog";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AdminFormField } from "@/components/admin/form-field";
import { PasswordInput } from "@/components/admin/password-input";
import { updateUserSchema, type UpdateUserFormValues } from "@/lib/schemas/user";
import { getMyProfile, updateMyProfile } from "@/lib/actions/profile";

const ROLE_LABEL = {
  ADMIN: "관리자",
  CUSTOMER: "고객",
  SELLER: "판매자",
  RIDER: "배달기사",
} as const;

interface MyInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * "내 정보/권한 설정" 다이얼로그.
 * 현재 로그인한 사용자의 정보를 users 테이블에서 로드하여 수정한다.
 * users 테이블에 없는 소속(department) 항목은 표시하지 않는다.
 */
export function MyInfoDialog({ open, onOpenChange }: MyInfoDialogProps) {
  const [roleLabel, setRoleLabel] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema) as unknown as Resolver<UpdateUserFormValues>,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "ADMIN",
      active: true,
      password: "",
    },
  });

  // 다이얼로그 오픈 시 현재 사용자 정보를 서버에서 로드
  useEffect(() => {
    if (!open) return;

    setLoading(true);
    getMyProfile()
      .then((profile) => {
        if (!profile) return;
        form.reset({
          name: profile.name,
          email: profile.email,
          phone: profile.phone ?? "",
          role: profile.role,
          active: true,
          password: "",
        });
        setRoleLabel(ROLE_LABEL[profile.role]);
      })
      .finally(() => setLoading(false));
  }, [open, form]);

  const handleSave = async (values: UpdateUserFormValues) => {
    const result = await updateMyProfile({
      name: values.name ?? "",
      phone: values.phone || null,
      password: values.password || undefined,
    });

    if (result.success) {
      toast.success(result.message);
      onOpenChange(false);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <LayerDialog
      open={open}
      onOpenChange={onOpenChange}
      title="내 정보 / 권한 설정"
      size="md"
      onConfirm={form.handleSubmit(handleSave)}
      confirmLabel="저장"
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <AdminFormField label="이름" required>
                <Input {...field} value={field.value ?? ""} disabled={loading} />
              </AdminFormField>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <AdminFormField label="이메일">
                <Input {...field} value={field.value ?? ""} readOnly disabled />
              </AdminFormField>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <AdminFormField label="전화번호">
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="010-0000-0000"
                  disabled={loading}
                />
              </AdminFormField>
            )}
          />
          <AdminFormField label="권한">
            <Input value={roleLabel} readOnly disabled />
          </AdminFormField>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <AdminFormField label="비밀번호 변경">
                <PasswordInput
                  {...field}
                  value={field.value ?? ""}
                  placeholder="변경 시에만 입력 (8자 이상)"
                  disabled={loading}
                />
              </AdminFormField>
            )}
          />
        </div>
      </Form>
    </LayerDialog>
  );
}
