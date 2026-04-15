"use client";

import { type ReactNode } from "react";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeaderBar,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DialogSize = "sm" | "md" | "lg";

const sizeClasses: Record<DialogSize, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-3xl",
};

interface LayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  size?: DialogSize;
  children: ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmLoading?: boolean;
  footer?: ReactNode; // 완전 커스텀 footer
}

export function LayerDialog({
  open,
  onOpenChange,
  title,
  size = "md",
  children,
  onConfirm,
  confirmLabel = "확인",
  cancelLabel = "취소",
  confirmLoading = false,
  footer,
}: LayerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(sizeClasses[size], "overflow-hidden p-0")}
        showCloseButton={false}
      >
        {/* 가이드 §12: 타이틀 바 bg #E5EDF4, X 우측 */}
        <DialogHeaderBar>
          <DialogTitle>{title}</DialogTitle>
          <DialogClose className="rounded opacity-70 transition-opacity hover:opacity-100">
            <X className="h-4 w-4" />
            <span className="sr-only">닫기</span>
          </DialogClose>
        </DialogHeaderBar>

        {/* 내용 — 가로 스크롤 금지, 세로 스크롤 허용 */}
        <DialogBody>{children}</DialogBody>

        {/* 하단 pill 버튼 (가이드 §12: h-40, w-100, rounded-full) */}
        <DialogFooter className="border-separator border-t">
          {footer ?? (
            <>
              <Button variant="outline-gray" size="popup" onClick={() => onOpenChange(false)}>
                {cancelLabel}
              </Button>
              {onConfirm && (
                <Button
                  variant="primary"
                  size="popup"
                  onClick={onConfirm}
                  disabled={confirmLoading}
                >
                  {confirmLoading ? "처리 중..." : confirmLabel}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
