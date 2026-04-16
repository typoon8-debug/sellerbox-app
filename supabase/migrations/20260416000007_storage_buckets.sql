-- ============================================================
-- 마이그레이션 7: Storage 버킷 생성
-- ============================================================

-- item-images 버킷 생성 (공개 읽기 가능, 최대 5MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'item-images',
  'item-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- RLS 활성화 (이미 활성화되어 있으나 명시적 선언)
-- storage.objects 테이블은 Supabase가 기본 관리

-- 공개 읽기 정책
CREATE POLICY "item_images_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'item-images');

-- 인증 사용자 업로드 정책
CREATE POLICY "item_images_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'item-images');

-- 인증 사용자 수정 정책
CREATE POLICY "item_images_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'item-images');

-- 인증 사용자 삭제 정책
CREATE POLICY "item_images_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'item-images');
