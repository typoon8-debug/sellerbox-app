-- delivery_address 컬럼이 이미 존재하므로 오타 컬럼(delivery_dddress)만 삭제
ALTER TABLE store DROP COLUMN IF EXISTS delivery_dddress;
