"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, X, Upload } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  value?: string | null;
  onChange: (dataUrl: string | null) => void;
  /** 파일 선택 시 원본 File 객체 콜백 (Storage 업로드 등에 사용) */
  onFileSelect?: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  preview?: boolean;
  /** 권장 이미지 너비(px) — 불일치 시 경고 토스트 */
  expectedWidth?: number;
  /** 권장 이미지 높이(px) — 불일치 시 경고 토스트 */
  expectedHeight?: number;
  /** 업로더 아래 표시할 사이즈 안내 문구 */
  sizeHint?: string;
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
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value ?? null);

  // 외부에서 value가 변경될 때 미리보기 동기화 (수정 다이얼로그 재오픈 등)
  useEffect(() => {
    setPreviewUrl(value ?? null);
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`파일 크기는 ${maxSizeMB}MB 이하여야 합니다.`);
      return;
    }

    // 원본 파일 콜백 (Storage 업로드에 활용)
    onFileSelect?.(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;

      // 이미지 크기 검증 (권장 사양과 다를 경우 경고)
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

    // 동일 파일 재선택 가능하도록 input 초기화
    e.target.value = "";
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange(null);
    onFileSelect?.(null);
  };

  return (
    <div className="flex flex-col gap-2">
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
