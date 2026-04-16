"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/admin/password-input";
import { loginSchema, type LoginFormValues } from "@/lib/schemas/auth";
import { loginAction } from "@/app/_actions/auth";
import { Mail } from "lucide-react";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    startTransition(async () => {
      // 성공 시 서버 액션에서 /stores로 redirect 처리
      // 에러 케이스에서만 result가 반환됨
      const result = await loginAction({ email: values.email, password: values.password });
      if (result && !result.ok) {
        toast.error(result.error.message);
      }
    });
  };

  return (
    <div className="bg-panel flex min-h-screen items-center justify-center px-4">
      <div className="bg-control border-separator shadow-popup w-full max-w-sm rounded border p-8">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-text-body text-2xl font-bold">셀러박스</h1>
          <p className="text-text-placeholder mt-1 text-sm">관리자 계정으로 로그인하세요</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="text-text-placeholder absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        {...field}
                        placeholder="admin@example.com"
                        type="email"
                        autoComplete="email"
                        className="pl-9"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" variant="primary" className="mt-2 w-full" disabled={isPending}>
              {isPending ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
