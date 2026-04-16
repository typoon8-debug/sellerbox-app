/**
 * 이미지 리사이징 유틸리티 (Canvas API 기반, 클라이언트 전용)
 * - stretch 모드: targetWidth + targetHeight 모두 지정 → 비율 무시 강제 맞춤
 * - fit-width 모드: targetWidth만 지정 → 가로 고정, 세로 원본 비율 유지
 */

/**
 * 이미지 파일을 지정 크기로 리사이징하여 PNG File과 dataUrl 반환
 * @param source 원본 File 또는 Blob
 * @param targetWidth 목표 너비(px)
 * @param targetHeight 목표 높이(px) — 생략 시 fit-width 모드(세로 비율 유지)
 * @param outputFileName 출력 파일명 (기본값: "resized.png")
 */
export function resizeImage(
  source: File | Blob,
  targetWidth: number,
  targetHeight?: number,
  outputFileName = "resized.png"
): Promise<{ file: File; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(source);
    const img = new window.Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // fit-width 모드: 가로 고정, 세로 비율 유지
      const drawHeight =
        targetHeight ?? Math.round(targetWidth * (img.naturalHeight / img.naturalWidth));

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = drawHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context를 생성할 수 없습니다."));
        return;
      }

      // stretch 또는 fit-width: 캔버스 전체에 이미지 그리기
      ctx.drawImage(img, 0, 0, targetWidth, drawHeight);

      const dataUrl = canvas.toDataURL("image/png");

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("이미지 변환에 실패했습니다."));
          return;
        }
        const file = new File([blob], outputFileName, { type: "image/png" });
        resolve({ file, dataUrl });
      }, "image/png");
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지를 로드할 수 없습니다."));
    };

    img.src = objectUrl;
  });
}

/**
 * ClipboardEvent에서 이미지 파일을 추출
 * clipboard의 items에서 image/* 타입 항목을 찾아 File로 반환
 * @param event 네이티브 ClipboardEvent
 * @returns 이미지 File 또는 null (이미지가 없는 경우)
 */
export function extractImageFromClipboard(event: ClipboardEvent): File | null {
  const items = event.clipboardData?.items;
  if (!items) return null;

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.startsWith("image/")) {
      return items[i].getAsFile();
    }
  }
  return null;
}
