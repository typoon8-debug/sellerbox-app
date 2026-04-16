-- ============================================================
-- 마이그레이션 6: RLS 정책
-- 전략: service_role(createAdminClient)은 RLS 우회, anon 키는 읽기 전용
-- ============================================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE tenant              ENABLE ROW LEVEL SECURITY;
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE store               ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_fulfillment   ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller              ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log           ENABLE ROW LEVEL SECURITY;
ALTER TABLE item                ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_detail         ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory           ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_txn       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item          ENABLE ROW LEVEL SECURITY;
ALTER TABLE picking_task        ENABLE ROW LEVEL SECURITY;
ALTER TABLE picking_item        ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_task        ENABLE ROW LEVEL SECURITY;
ALTER TABLE label               ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment            ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_event      ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_request    ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_quick_policy  ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_quick_timeslot ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_quick_slot_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion           ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_item      ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon              ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_issurance    ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemption   ENABLE ROW LEVEL SECURITY;
ALTER TABLE fp_ad_content       ENABLE ROW LEVEL SECURITY;
ALTER TABLE fp_ad_schedule      ENABLE ROW LEVEL SECURITY;
ALTER TABLE fp_ad_target        ENABLE ROW LEVEL SECURITY;
ALTER TABLE fp_ad_cap           ENABLE ROW LEVEL SECURITY;
ALTER TABLE fp_ad_log           ENABLE ROW LEVEL SECURITY;
ALTER TABLE cs_ticket           ENABLE ROW LEVEL SECURITY;
ALTER TABLE review              ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceo_review          ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────
-- 인증된 사용자 (authenticated) — 전체 읽기 허용
-- 쓰기는 service_role이 RLS를 우회하여 수행
-- ──────────────────────────────────────────────────────────────

-- 핵심 테이블: 인증 사용자 읽기 허용
CREATE POLICY "authenticated_select" ON tenant
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON store
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON store_fulfillment
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON seller
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON audit_log
  FOR SELECT TO authenticated USING (true);

-- 상품/재고
CREATE POLICY "authenticated_select" ON item
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON item_detail
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON inventory
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON inventory_txn
  FOR SELECT TO authenticated USING (true);

-- 주문/풀필먼트
CREATE POLICY "authenticated_select" ON "order"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON order_item
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON picking_task
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON picking_item
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON packing_task
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON label
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON shipment
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON shipment_event
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON dispatch_request
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON store_quick_policy
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON store_quick_timeslot
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON store_quick_slot_usage
  FOR SELECT TO authenticated USING (true);

-- 프로모션/쿠폰
CREATE POLICY "authenticated_select" ON promotion
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON promotion_item
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON coupon
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON coupon_issurance
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON coupon_redemption
  FOR SELECT TO authenticated USING (true);

-- 광고/CS/리뷰
CREATE POLICY "authenticated_select" ON fp_ad_content
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON fp_ad_schedule
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON fp_ad_target
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON fp_ad_cap
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON fp_ad_log
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON cs_ticket
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON review
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON ceo_review
  FOR SELECT TO authenticated USING (true);

-- ──────────────────────────────────────────────────────────────
-- anon 역할 — 공개 데이터만 읽기 허용
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "anon_select_store" ON store
  FOR SELECT TO anon USING (status = 'ACTIVE');

CREATE POLICY "anon_select_item" ON item
  FOR SELECT TO anon USING (status = 'ACTIVE');

CREATE POLICY "anon_select_review" ON review
  FOR SELECT TO anon USING (status = 'VISIBLE');
