"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/admin/password-input";
import { verifyAdminPassword } from "@/app/_actions/auth";
import { toast } from "sonner";

interface PasswordConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 비밀번호 확인 후 실행할 콜백 */
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
}

/**
 * 민감 작업(삭제) 전 관리자 비밀번호 재확인 다이얼로그
 * verifyAdminPassword server action으로 서버 측 재검증 수행
 */
export function PasswordConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "비밀번호 확인",
  description = "이 작업을 수행하려면 관리자 비밀번호를 입력해 주세요.",
  confirmLabel = "확인 후 삭제",
}: PasswordConfirmDialogProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = (open: boolean) => {
    if (!open) {
      setPassword("");
      setLoading(false);
    }
    onOpenChange(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("비밀번호를 입력해 주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyAdminPassword(password);
      if (!res.ok) {
        toast.error(res.error.message);
        setPassword("");
        return;
      }
      // 검증 성공 → 다이얼로그 닫고 onConfirm 실행
      handleClose(false);
      onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <form onSubmit={handleSubmit}>
          <AlertDialogHeader className="px-6 pt-5 pb-2">
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="px-6 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reauth-password">비밀번호</Label>
              <PasswordInput
                id="reauth-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="현재 비밀번호 입력"
                autoFocus
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleClose(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button type="submit" variant="destructive" disabled={loading || !password.trim()}>
              {loading ? "확인 중..." : confirmLabel}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
