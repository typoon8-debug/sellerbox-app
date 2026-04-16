"use server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 이미지 파일을 Supabase Storage에 업로드하고 공개 URL을 반환
 * - Admin 클라이언트 사용으로 버킷 자동 생성 및 RLS 우회
 * @param bucket  버킷 이름
 * @param formData 업로드할 파일이 담긴 FormData (key: "file")
 * @returns 공개 URL
 */
export async function uploadImageAction(
  bucket: string,
  formData: FormData
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "파일이 없습니다." };
  }

  const supabase = createAdminClient();

  // 버킷이 없으면 자동 생성
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === bucket);
  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });
    if (createError) {
      return { ok: false, error: `버킷 생성 실패: ${createError.message}` };
    }
  }

  const path = `${Date.now()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    return { ok: false, error: `업로드 실패: ${uploadError.message}` };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
