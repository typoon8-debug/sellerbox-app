"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeaderBar,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ClipboardPaste } from "lucide-react";
import { DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { resizeImage, extractImageFromClipboard } from "@/lib/utils/image-resize";
import { uploadImageAction } from "@/lib/actions/storage.actions";

interface ImagePasteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Storage 버킷 이름 */
  bucket?: string;
  /** 리사이징 기준 너비(px) */
  expectedWidth?: number;
  /** 리사이징 기준 높이(px) — 생략 시 fit-width 모드 */
  expectedHeight?: number;
  /** true이면 expectedWidth/Height로 자동 리사이징 */
  autoResize?: boolean;
  /** 업로드 성공 시 publicUrl 전달 */
  onComplete: (publicUrl: string) => void;
}

export function ImagePasteDialog({
  open,
  onOpenChange,
  bucket = "item-images",
  expectedWidth,
  expectedHeight,
  autoResize = false,
  onComplete,
}: ImagePasteDialogProps) {
  const pasteZoneRef = useRef<HTMLDivElement>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 팝업 열릴 때 상태 초기화 + paste 영역에 포커스
  useEffect(() => {
    if (open) {
      setPreviewDataUrl(null);
      setPendingFile(null);
      setIsUploading(false);
      // Radix Dialog 애니메이션 이후 포커스
      const timer = setTimeout(() => {
        pasteZoneRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const file = extractImageFromClipboard(e.nativeEvent);
      if (!file) return;
      e.preventDefault();

      let processedFile = file;
      let dataUrl: string;

      if (autoResize && expectedWidth) {
        try {
          const result = await resizeImage(file, expectedWidth, expectedHeight, "resized.png");
          processedFile = result.file;
          dataUrl = result.dataUrl;
        } catch {
          toast.error("이미지 리사이징 중 오류가 발생했습니다.");
          return;
        }
      } else {
        // 리사이징 없이 dataUrl 생성 (미리보기용)
        dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      setPreviewDataUrl(dataUrl);
      setPendingFile(processedFile);
    },
    [autoResize, expectedWidth, expectedHeight]
  );

  const handleConfirm = async () => {
    if (!pendingFile) return;
    setIsUploading(true);

    const fd = new FormData();
    fd.append("file", pendingFile);
    const result = await uploadImageAction(bucket, fd);
    setIsUploading(false);

    if (!result.ok) {
      toast.error(`이미지 업로드 실패: ${result.error}`);
      return;
    }

    onComplete(result.url);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-sm" showCloseButton={false}>
        <DialogHeaderBar>
          <DialogTitle>이미지 붙여넣기</DialogTitle>
          <DialogClose className="rounded opacity-70 transition-opacity hover:opacity-100">
            <X className="h-4 w-4" />
            <span className="sr-only">닫기</span>
          </DialogClose>
        </DialogHeaderBar>

        <div className="p-4">
          {/* paste 영역 */}
          <div
            ref={pasteZoneRef}
            tabIndex={0}
            onPaste={handlePaste}
            className="border-separator focus:border-primary focus:ring-primary/20 relative flex min-h-48 cursor-default flex-col items-center justify-center gap-3 rounded border-2 border-dashed outline-none focus:ring-2"
          >
            {previewDataUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewDataUrl}
                  alt="붙여넣기 미리보기"
                  className="max-h-40 max-w-full rounded object-contain"
                />
                <p className="text-text-placeholder text-xs">다시 붙여넣으면 교체됩니다</p>
              </>
            ) : (
              <>
                <ClipboardPaste className="text-text-placeholder h-10 w-10" />
                <p className="text-sm font-medium">이미지를 복사한 후</p>
                <p className="text-text-placeholder -mt-2 text-sm">
                  여기서{" "}
                  <kbd className="bg-control rounded px-1 py-0.5 font-mono text-xs">Ctrl+V</kbd> 를
                  누르세요
                </p>
                {autoResize && expectedWidth && (
                  <p className="text-text-placeholder text-xs">
                    자동 리사이징:{" "}
                    {expectedHeight
                      ? `${expectedWidth}×${expectedHeight}px`
                      : `가로 ${expectedWidth}px 고정`}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="border-separator border-t">
          <Button variant="outline-gray" size="popup" onClick={handleClose}>
            취소
          </Button>
          <Button
            variant="primary"
            size="popup"
            onClick={handleConfirm}
            disabled={!pendingFile || isUploading}
          >
            {isUploading ? "업로드 중..." : "확인"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
