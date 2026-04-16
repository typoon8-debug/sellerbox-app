"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, X, Upload, ClipboardPaste } from "lucide-react";
import { toast } from "sonner";
import { resizeImage } from "@/lib/utils/image-resize";
import { uploadImageAction } from "@/lib/actions/storage.actions";
import { ImagePasteDialog } from "@/components/admin/image-paste-dialog";

interface ImageUploaderProps {
  value?: string | null;
  /** 업로드 완료 후 Storage publicUrl 전달 (base64 dataUrl 아님) */
  onChange: (url: string | null) => void;
  accept?: string;
  maxSizeMB?: number;
  preview?: boolean;
  /** 리사이징 기준 너비(px) */
  expectedWidth?: number;
  /** 리사이징 기준 높이(px) — 생략 시 fit-width 모드 */
  expectedHeight?: number;
  /** 업로더 아래 표시할 사이즈 안내 문구 */
  sizeHint?: string;
  /**
   * true이면 expectedWidth(필수)/expectedHeight(선택)로 자동 리사이징 후 PNG 변환
   * - expectedWidth + expectedHeight: stretch 모드 (강제 맞춤)
   * - expectedWidth만: fit-width 모드 (가로 고정, 세로 비율 유지)
   */
  autoResize?: boolean;
  /** Storage 버킷 이름 (기본값: "item-images") */
  bucket?: string;
}

export function ImageUploader({
  value,
  onChange,
  accept = "image/*",
  maxSizeMB = 5,
  preview = true,
  expectedWidth,
  expectedHeight,
  sizeHint,
  autoResize = false,
  bucket = "item-images",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [pasteDialogOpen, setPasteDialogOpen] = useState(false);

  // 외부에서 value가 변경될 때 미리보기 동기화 (수정 다이얼로그 재오픈 등)
  useEffect(() => {
    setPreviewUrl(value ?? null);
  }, [value]);

  /**
   * 이미지 처리 공통 파이프라인 — 파일 선택 경로
   * 1. 크기 검증
   * 2. autoResize 시 Canvas 리사이징
   * 3. 즉시 Storage 업로드
   * 4. onChange(publicUrl) — base64 dataUrl은 form에 저장되지 않음
   */
  const processAndUpload = useCallback(
    async (file: File) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`파일 크기는 ${maxSizeMB}MB 이하여야 합니다.`);
        return;
      }

      setIsUploading(true);

      let uploadFile = file;
      let localPreview: string | undefined;

      if (autoResize && expectedWidth) {
        try {
          const { file: resizedFile, dataUrl } = await resizeImage(
            file,
            expectedWidth,
            expectedHeight,
            "resized.png"
          );
          uploadFile = resizedFile;
          localPreview = dataUrl; // 업로드 중 로컬 미리보기 표시용
        } catch {
          toast.error("이미지 리사이징 중 오류가 발생했습니다.");
          setIsUploading(false);
          return;
        }
      }

      // 로컬 미리보기 즉시 표시 (업로드 완료 전 UX)
      if (localPreview) {
        setPreviewUrl(localPreview);
      }

      const fd = new FormData();
      fd.append("file", uploadFile);
      const result = await uploadImageAction(bucket, fd);
      setIsUploading(false);

      if (!result.ok) {
        toast.error(`이미지 업로드 실패: ${result.error}`);
        // 업로드 실패 시 미리보기를 이전 값으로 복구
        setPreviewUrl(value ?? null);
        return;
      }

      // 업로드 성공: publicUrl로 미리보기 + 부모 form 업데이트
      setPreviewUrl(result.url);
      onChange(result.url);
    },
    [autoResize, expectedWidth, expectedHeight, maxSizeMB, bucket, onChange, value]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAndUpload(file);
    e.target.value = "";
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange(null);
  };

  /** 붙여넣기 팝업에서 업로드 완료 후 publicUrl 수신 */
  const handlePasteComplete = useCallback(
    (publicUrl: string) => {
      setPreviewUrl(publicUrl);
      onChange(publicUrl);
    },
    [onChange]
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* 미리보기 */}
        {preview && previewUrl && (
          <div className="bg-panel border-separator relative h-28 w-40 overflow-hidden rounded border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="미리보기" className="h-full w-full object-contain" />
            {!isUploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="bg-control/80 hover:bg-control absolute top-1 right-1 rounded-full p-0.5 shadow"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {isUploading && (
              <div className="bg-background/60 absolute inset-0 flex items-center justify-center">
                <span className="text-xs">업로드 중...</span>
              </div>
            )}
          </div>
        )}

        {/* 빈 상태 */}
        {(!previewUrl || !preview) && (
          <div className="text-text-placeholder border-neutral-line/50 bg-panel flex h-28 w-40 flex-col items-center justify-center gap-1 rounded border-2 border-dashed">
            <ImageIcon className="h-6 w-6" />
            <span className="text-xs">이미지 없음</span>
            {sizeHint && <span className="text-xs opacity-60">{sizeHint}</span>}
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline-gray"
            size="sm"
            className="h-7 text-xs"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="mr-1 h-3 w-3" />
            {isUploading ? "업로드 중..." : previewUrl ? "변경" : "업로드"}
          </Button>
          <Button
            type="button"
            variant="outline-gray"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setPasteDialogOpen(true)}
            disabled={isUploading}
          >
            <ClipboardPaste className="mr-1 h-3 w-3" />
            붙여넣기
          </Button>
          {previewUrl && !isUploading && (
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

        {/* 권장 사이즈 안내 */}
        {sizeHint && previewUrl && (
          <span className="text-text-placeholder text-xs">{sizeHint}</span>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* 붙여넣기 팝업 */}
      <ImagePasteDialog
        open={pasteDialogOpen}
        onOpenChange={setPasteDialogOpen}
        bucket={bucket}
        expectedWidth={expectedWidth}
        expectedHeight={expectedHeight}
        autoResize={autoResize}
        onComplete={handlePasteComplete}
      />
    </>
  );
}
