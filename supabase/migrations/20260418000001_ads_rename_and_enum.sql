-- ============================================================
-- 마이그레이션: fp_ad_* → ad_* 테이블 rename + placement_id CHECK 제약
-- ============================================================

-- ─── 1. 테이블 rename ─────────────────────────────────────────────────────────
ALTER TABLE fp_ad_content  RENAME TO ad_content;
ALTER TABLE fp_ad_schedule RENAME TO ad_schedule;
ALTER TABLE fp_ad_target   RENAME TO ad_target;
ALTER TABLE fp_ad_cap      RENAME TO ad_cap;
ALTER TABLE fp_ad_log      RENAME TO ad_log;

-- ─── 2. 인덱스 rename ────────────────────────────────────────────────────────
ALTER INDEX IF EXISTS idx_fp_ad_content_store   RENAME TO idx_ad_content_store;
ALTER INDEX IF EXISTS idx_fp_ad_schedule_content RENAME TO idx_ad_schedule_content;
ALTER INDEX IF EXISTS idx_fp_ad_target_content  RENAME TO idx_ad_target_content;
ALTER INDEX IF EXISTS idx_fp_ad_cap_content     RENAME TO idx_ad_cap_content;
ALTER INDEX IF EXISTS idx_fp_ad_log_content     RENAME TO idx_ad_log_content;
ALTER INDEX IF EXISTS idx_fp_ad_log_ts          RENAME TO idx_ad_log_ts;

-- ─── 3. placement_id 기존 데이터 정규화 (유효하지 않은 값 → HERO) ──────────────
UPDATE ad_content
  SET placement_id = 'HERO'
  WHERE placement_id NOT IN ('HERO', 'MID_1', 'MID_2', 'FOOTER');

-- ─── 4. placement_id CHECK 제약 추가 ─────────────────────────────────────────
ALTER TABLE ad_content
  ADD CONSTRAINT ad_content_placement_id_check
  CHECK (placement_id IN ('HERO', 'MID_1', 'MID_2', 'FOOTER'));
