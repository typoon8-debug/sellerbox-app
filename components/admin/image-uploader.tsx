"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { resizeImage, extractImageFromClipboard } from "@/lib/utils/image-resize";

interface ImageUploaderProps {
  value?: string | null;
  onChange: (dataUrl: string | null) => void;
  /** 파일 선택 시 원본(또는 리사이즈된) File 객체 콜백 (Storage 업로드 등에 사용) */
  onFileSelect?: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  preview?: boolean;
  /** 권장 이미지 너비(px) — autoResize true 시 리사이징 기준 너비 */
  expectedWidth?: number;
  /** 권장 이미지 높이(px) — autoResize true 시 리사이징 기준 높이 (생략 시 비율 유지) */
  expectedHeight?: number;
  /** 업로더 아래 표시할 사이즈 안내 문구 */
  sizeHint?: string;
  /**
   * true이면 expectedWidth(필수)/expectedHeight(선택)로 자동 리사이징 후 PNG 변환
   * - expectedWidth + expectedHeight: stretch 모드 (강제 맞춤)
   * - expectedWidth만: fit-width 모드 (가로 고정, 세로 비율 유지)
   */
  autoResize?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  onFileSelect,
  accept = "image/*",
  maxSizeMB = 5,
  preview = true,
  expectedWidth,
  expectedHeight,
  sizeHint,
  autoResize = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value ?? null);

  // 외부에서 value가 변경될 때 미리보기 동기화 (수정 다이얼로그 재오픈 등)
  useEffect(() => {
    setPreviewUrl(value ?? null);
  }, [value]);

  /**
   * 이미지 처리 공통 파이프라인
   * 파일 선택 및 Ctrl+V 붙여넣기 모두 이 함수를 경유
   */
  const processImage = useCallback(
    async (file: File) => {
      // 파일 크기 검증
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`파일 크기는 ${maxSizeMB}MB 이하여야 합니다.`);
        return;
      }

      // autoResize 모드: Canvas로 리사이징 후 PNG 변환
      if (autoResize && expectedWidth) {
        try {
          const { file: resizedFile, dataUrl } = await resizeImage(
            file,
            expectedWidth,
            expectedHeight,
            "resized.png"
          );
          onFileSelect?.(resizedFile);
          setPreviewUrl(dataUrl);
          onChange(dataUrl);
        } catch {
          toast.error("이미지 리사이징 중 오류가 발생했습니다.");
        }
        return;
      }

      // 기본 모드: FileReader로 dataUrl 변환 + 크기 경고
      onFileSelect?.(file);

      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;

        if (expectedWidth && expectedHeight) {
          const img = new window.Image();
          img.onload = () => {
            if (img.naturalWidth !== expectedWidth || img.naturalHeight !== expectedHeight) {
              toast.warning(
                `권장 사이즈와 다릅니다. 권장: ${expectedWidth}×${expectedHeight}px / 업로드: ${img.naturalWidth}×${img.naturalHeight}px`,
                { duration: 5000 }
              );
            }
            setPreviewUrl(dataUrl);
            onChange(dataUrl);
          };
          img.src = dataUrl;
        } else {
          setPreviewUrl(dataUrl);
          onChange(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    },
    [autoResize, expectedWidth, expectedHeight, maxSizeMB, onChange, onFileSelect]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImage(file);
    // 동일 파일 재선택 가능하도록 input 초기화
    e.target.value = "";
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange(null);
    onFileSelect?.(null);
  };

  /** Ctrl+V 붙여넣기 — 포커스된 ImageUploader에만 적용 */
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const file = extractImageFromClipboard(e.nativeEvent);
      if (!file) return;
      e.preventDefault();
      processImage(file);
    },
    [processImage]
  );

  return (
    <div
      className="focus-within:ring-primary/20 flex flex-col gap-2 rounded outline-none focus-within:ring-2"
      tabIndex={0}
      onPaste={handlePaste}
    >
      {/* 미리보기 */}
      {preview && previewUrl && (
        <div className="bg-panel border-separator relative h-28 w-40 overflow-hidden rounded border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="미리보기" className="h-full w-full object-contain" />
          <button
            type="button"
            onClick={handleRemove}
            className="bg-control/80 hover:bg-control absolute top-1 right-1 rounded-full p-0.5 shadow"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 빈 상태 */}
      {(!previewUrl || !preview) && (
        <div
          className="text-text-placeholder border-neutral-line/50 bg-panel hover:border-neutral-line flex h-28 w-40 cursor-pointer flex-col items-center justify-center gap-1 rounded border-2 border-dashed transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <ImageIcon className="h-6 w-6" />
          <span className="text-xs">이미지 선택</span>
          <span className="text-[10px] opacity-50">또는 Ctrl+V</span>
          {sizeHint && <span className="text-xs opacity-60">{sizeHint}</span>}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline-gray"
          size="sm"
          className="h-7 text-xs"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-1 h-3 w-3" />
          {previewUrl ? "변경" : "업로드"}
        </Button>
        {previewUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-alert-red h-7 text-xs"
            onClick={handleRemove}
          >
            삭제
          </Button>
        )}
        <span className="text-text-placeholder text-xs">최대 {maxSizeMB}MB</span>
      </div>

      {/* 권장 사이즈 안내 (미리보기 있을 때도 표시) */}
      {sizeHint && previewUrl && <span className="text-text-placeholder text-xs">{sizeHint}</span>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
