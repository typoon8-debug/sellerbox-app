-- ============================================================
-- 시드 데이터: 기본 테넌트, 관리자 사용자, 판매원, 가게
-- E2E 테스트 시드(e2e/fixtures/seed.ts)와 ID가 일치하도록 고정 UUID 사용
-- ============================================================

-- 테넌트 (실제 DB: code, type 컬럼 포함)
INSERT INTO tenant (tenant_id, name, code, type, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Sellerbox', 'SELLERBOX', 'VENDOR', 'ACTIVE')
ON CONFLICT (tenant_id) DO NOTHING;

-- 관리자 사용자 (실제 DB: active 컬럼, auth_user_id nullable)
INSERT INTO users (user_id, email, name, role, active, tenant_id)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'typoon8@gmail.com',
  '관리자',
  'ADMIN',
  true,
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (email) DO NOTHING;

-- 가게
INSERT INTO store (
  store_id, tenant_id, name, store_category, address, phone,
  min_delivery_price, delivery_tip, reg_number, jumin_number,
  ceo_name, reg_code, fee, contract_start_at, contract_end_at, status
)
VALUES (
  '00000000-0000-0000-0000-000000000100',
  '00000000-0000-0000-0000-000000000001',
  '셀러박스 테스트 매장',
  '편의점',
  '서울특별시 강남구 테헤란로 123',
  '02-1234-5678',
  10000, 3000,
  '123-45-67890', '900101-1234567',
  '홍길동', 'REG001', 5,
  '2026-01-01T00:00:00+09:00',
  '2026-12-31T23:59:59+09:00',
  'ACTIVE'
)
ON CONFLICT (store_id) DO NOTHING;

-- 판매원 (OWNER)
INSERT INTO seller (seller_id, email, name, role, store_id, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000020',
  'typoon8@gmail.com',
  '점주',
  'OWNER',
  '00000000-0000-0000-0000-000000000100',
  'ACTIVE'
)
ON CONFLICT (seller_id) DO NOTHING;

-- 판매원 (MANAGER) - PRD 테스트 계정
INSERT INTO seller (seller_id, email, name, role, store_id, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000021',
  'typoon8@gmail.com',
  '매장관리자',
  'MANAGER',
  '00000000-0000-0000-0000-000000000100',
  'ACTIVE'
)
ON CONFLICT (seller_id) DO NOTHING;

-- 가게 풀필먼트 (배달, 픽업)
INSERT INTO store_fulfillment (id, store_id, fulfillment_type, active)
VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000100', 'DELIVERY', true),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000100', 'PICKUP', true)
ON CONFLICT (id) DO NOTHING;

-- 샘플 상품 3개
INSERT INTO item (item_id, store_id, sku, category_code_value, category_name, name, list_price, sale_price, status)
VALUES
  ('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000100', 'SKU-001', 'FOOD', '식품', '유기농 사과 1kg', 15000, 12000, 'ACTIVE'),
  ('00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000100', 'SKU-002', 'FOOD', '식품', '프리미엄 우유 1L', 3500, 3000, 'ACTIVE'),
  ('00000000-0000-0000-0000-000000001003', '00000000-0000-0000-0000-000000000100', 'SKU-003', 'BEVERAGE', '음료', '아메리카노 원두 500g', 18000, 15000, 'ACTIVE')
ON CONFLICT (item_id) DO NOTHING;

-- 재고
INSERT INTO inventory (inventory_id, store_id, item_id, on_hand, reserved, safety_stock, status)
VALUES
  ('00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000001001', 100, 5, 10, 'AVAILABLE'),
  ('00000000-0000-0000-0000-000000002002', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000001002', 200, 0, 20, 'AVAILABLE'),
  ('00000000-0000-0000-0000-000000002003', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000001003', 50, 2, 5, 'AVAILABLE')
ON CONFLICT (inventory_id) DO NOTHING;

-- 샘플 주문
INSERT INTO "order" (
  order_id, store_id, customer_id, order_no,
  discounted_total_price, origin_total_price,
  delivery_method, delivery_fee, delivery_price, order_price, final_payable, status
)
VALUES (
  '00000000-0000-0000-0000-000000003001',
  '00000000-0000-0000-0000-000000000100',
  '00000000-0000-0000-0000-000000000010',
  'ORD-20260416-001',
  27000, 30000,
  'DELIVERY', 3000, 3000, 27000, 30000, 'PAID'
)
ON CONFLICT (order_id) DO NOTHING;

-- 주문 상품
INSERT INTO order_item (order_detail_id, order_id, item_id, qty, unit_price, line_total, status)
VALUES
  ('00000000-0000-0000-0000-000000003101', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000001001', 1, 12000, 12000, 'ORDERED'),
  ('00000000-0000-0000-0000-000000003102', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000001002', 2, 3000, 6000, 'ORDERED'),
  ('00000000-0000-0000-0000-000000003103', '00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000001003', 1, 15000, 15000, 'ORDERED')
ON CONFLICT (order_detail_id) DO NOTHING;
