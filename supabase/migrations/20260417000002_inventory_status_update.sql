-- 재고 상태값 변경: DAMAGED/ADJUSTED → STOP
-- 기존 DAMAGED/ADJUSTED 상태 레코드를 STOP으로 일괄 변환
UPDATE inventory
SET status = 'STOP'
WHERE status IN ('DAMAGED', 'ADJUSTED');

-- 기존 CHECK 제약 제거 후 새 제약 추가
ALTER TABLE inventory
  DROP CONSTRAINT IF EXISTS inventory_status_check;

ALTER TABLE inventory
  ADD CONSTRAINT inventory_status_check
    CHECK (status IN ('AVAILABLE', 'RESERVED', 'STOP'));
