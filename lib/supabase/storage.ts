import { createClient } from "@/lib/supabase/client";

/**
 * Supabase Image Transform URL 생성
 * Supabase Storage의 이미지 변환 기능을 활용해 리사이즈된 URL을 반환
 *
 * @param url     - 원본 Supabase Storage 공개 URL
 * @param width   - 원하는 이미지 너비(px)
 * @param quality - JPEG 품질 (1~100, 기본값 80)
 * @returns       변환 파라미터가 적용된 URL 문자열
 *
 * @example
 * const thumb = getTransformUrl(item.image_url, 200, 70);
 */
export function getTransformUrl(url: string, width: number, quality = 80): string {
  if (!url) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}width=${width}&quality=${quality}`;
}

/**
 * Supabase Storage에 이미지 업로드 후 공개 URL 반환
 * @param bucket - Storage 버킷 이름
 * @param file - 업로드할 파일
 * @returns 공개 접근 가능한 URL
 */
export async function uploadImage(bucket: string, file: File): Promise<string> {
  const supabase = createClient();
  const path = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) {
    throw new Error(`이미지 업로드 실패: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
