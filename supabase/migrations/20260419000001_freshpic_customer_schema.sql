-- ============================================================
-- FreshPic 고객 앱 스키마 마이그레이션
-- 파일: 20260419000001_freshpic_customer_schema.sql
-- ============================================================
-- 생성 테이블 (신규 12개):
--   customer, address, customer_shop, wishlist,
--   cart, cart_item, payment, point_history,
--   memo, memo_item, memo_recipe, memo_recipe_ingredient
--
-- 참조 테이블 (기존 — 동일 DB에 이미 존재):
--   store, item, "order", shipment, shipment_event, review
--
-- 기존 테이블 FK 보강 (섹션 말미 ALTER TABLE 참고):
--   "order".customer_id → customer(customer_id)
--   "order".address_id  → address(address_id)  ※ 타입 변경 포함
-- ============================================================


-- ============================================================
-- 섹션 1: customer (회원)
-- ============================================================
-- FreshPic 앱 사용자. Supabase Auth의 auth.users와 별개로 앱 전용
-- customer_id는 auth.users.id와 동일 UUID로 동기화할 수 있음
CREATE TABLE IF NOT EXISTS customer (
  customer_id      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email            VARCHAR(100) NOT NULL UNIQUE,
  password_hash    VARCHAR(255) NOT NULL,
  name             VARCHAR(50)  NOT NULL,
  phone            VARCHAR(20)  NOT NULL UNIQUE,
  birthdate        DATE,
  job              VARCHAR(20),
  gender           TEXT         CHECK (gender IN ('M', 'F', 'O')),
  grade            TEXT         NOT NULL DEFAULT 'BRONZE'
                                CHECK (grade IN ('BRONZE', 'SILVER', 'GOLD', 'VIP', 'ADMIN')),
  role             TEXT         NOT NULL DEFAULT 'CUSTOMER'
                                CHECK (role IN ('CUSTOMER', 'SELLER', 'RIDER', 'ADMIN')),

  -- 최근 사용 주소 (비정규화 — address 테이블의 복사본)
  zipcode          VARCHAR(10),
  sido             VARCHAR(50),
  sigungu          VARCHAR(50),
  eupmyeondong     VARCHAR(50),
  road_name        VARCHAR(100),
  building_no      VARCHAR(20),
  building_name    VARCHAR(100),
  detail_address   VARCHAR(100),

  -- 마케팅 동의
  marketing_optin  BOOLEAN      NOT NULL DEFAULT false,
  privacy_consent  BOOLEAN      NOT NULL DEFAULT false,
  location_consent BOOLEAN      NOT NULL DEFAULT false,

  status           TEXT         NOT NULL DEFAULT 'ACTIVE'
                                CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED', 'DELETED')),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  modified_at      TIMESTAMPTZ
);

COMMENT ON TABLE  customer                 IS '회원';
COMMENT ON COLUMN customer.grade           IS 'BRONZE|SILVER|GOLD|VIP|ADMIN';
COMMENT ON COLUMN customer.role            IS 'CUSTOMER|SELLER|RIDER|ADMIN';
COMMENT ON COLUMN customer.detail_address  IS '비정규화 — address 테이블 최근 주소 복사';


-- ============================================================
-- 섹션 2: address (회원주소)
-- ============================================================
-- order.address_id → 이 테이블의 PK를 FK 대상으로 사용
CREATE TABLE IF NOT EXISTS address (
  address_id   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID         NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  address_name VARCHAR(255) NOT NULL,   -- "우리집", "회사", "기타"
  address      TEXT         NOT NULL,   -- 전체 주소 문자열
  message      VARCHAR(255),            -- 배송 메시지 (문 앞에 놓아주세요, 등)
  status       TEXT         NOT NULL DEFAULT 'ACTIVE'
                            CHECK (status IN ('ACTIVE', 'INACTIVE', 'DEFAULT')),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  modified_at  TIMESTAMPTZ
);

COMMENT ON TABLE  address         IS '회원주소 — order.address_id FK 대상';
COMMENT ON COLUMN address.status  IS 'DEFAULT = 기본배송지';


-- ============================================================
-- 섹션 3: customer_shop (회원상점)
-- ============================================================
-- 고객 ↔ 가게 관계 + 가게별 포인트 잔액 관리
CREATE TABLE IF NOT EXISTS customer_shop (
  customer_id    UUID NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  store_id       UUID NOT NULL REFERENCES store(store_id)      ON DELETE CASCADE,
  point_balance  INT  NOT NULL DEFAULT 0,   -- 현재 가용 포인트
  point_pending  INT  NOT NULL DEFAULT 0,   -- 미확정(적립 예정) 포인트
  status         TEXT NOT NULL DEFAULT 'ACTIVE'
                      CHECK (status IN ('ACTIVE', 'LEFT', 'BANNED', 'PENDING')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (customer_id, store_id)
);

COMMENT ON TABLE customer_shop IS '회원상점 — 고객-가게 관계 + 포인트 잔액';


-- ============================================================
-- 섹션 4: wishlist (위시리스트)
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlist (
  customer_id UUID NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  store_id    UUID NOT NULL REFERENCES store(store_id)       ON DELETE CASCADE,
  item_id     UUID NOT NULL REFERENCES item(item_id)         ON DELETE CASCADE,
  quantity    INT  NOT NULL DEFAULT 1,
  status      TEXT NOT NULL DEFAULT 'ACTIVE'
                   CHECK (status IN ('ACTIVE', 'REMOVED')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_at TIMESTAMPTZ,
  PRIMARY KEY (customer_id, store_id, item_id)
);

COMMENT ON TABLE wishlist IS '위시리스트 — 고객-가게-상품 복합 PK';


-- ============================================================
-- 섹션 5: cart (장바구니 헤더)
-- ============================================================
-- ERD: CART ||--o{ CART_ITEM
-- cart = 헤더(고객+가게 단위), cart_item = 항목 행
CREATE TABLE IF NOT EXISTS cart (
  cart_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  store_id    UUID NOT NULL REFERENCES store(store_id)       ON DELETE CASCADE,
  order_id    UUID REFERENCES "order"(order_id) ON DELETE SET NULL,  -- 주문 완료 시 연결
  status      TEXT NOT NULL DEFAULT 'ACTIVE'
                   CHECK (status IN ('ACTIVE', 'ORDERED', 'ABANDONED')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_at TIMESTAMPTZ
);

COMMENT ON TABLE  cart          IS '장바구니 헤더';
COMMENT ON COLUMN cart.order_id IS '주문 완료 시 연결되는 order.order_id';


-- ============================================================
-- 섹션 6: cart_item (장바구니 항목)
-- ============================================================
-- ERD CSV의 cart 테이블(item_id 포함)을 cart_item으로 분리
CREATE TABLE IF NOT EXISTS cart_item (
  cart_item_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id        UUID NOT NULL REFERENCES cart(cart_id)   ON DELETE CASCADE,
  item_id        UUID NOT NULL REFERENCES item(item_id)   ON DELETE CASCADE,
  item_option_id UUID,                  -- 옵션 상품일 경우 (향후 item_option 테이블 FK)
  quantity       INT  NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status         TEXT NOT NULL DEFAULT 'ACTIVE'
                      CHECK (status IN ('ACTIVE', 'ORDERED', 'REMOVED')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_at    TIMESTAMPTZ
);

COMMENT ON TABLE  cart_item                IS '장바구니 항목 (cart 1:N)';
COMMENT ON COLUMN cart_item.item_option_id IS '옵션 상품 미사용 시 NULL';


-- ============================================================
-- 섹션 7: payment (결제)
-- ============================================================
-- ERD: ORDER ||--o|{ PAYMENT (order 1건에 payment 1건, 취소재결제 시 복수 가능)
CREATE TABLE IF NOT EXISTS payment (
  payment_id      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID          NOT NULL REFERENCES "order"(order_id) ON DELETE CASCADE,
  pg_tx_id        VARCHAR(64),                  -- PG사 거래 ID
  points_used     INT           NOT NULL DEFAULT 0,          -- 사용한 포인트
  delivery_method TEXT          CHECK (delivery_method IN (
                    'QUICK', 'RO_ONDEMAND', 'BBQ', 'PICKUP',
                    'RESERVE', 'FRESH_MORNING', 'SAME_DAY', '3P_DELIVERY'
                  )),
  delivery_fee    NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,          -- 실제 결제 금액
  payment_method  VARCHAR(20),                               -- 카드, 포인트, 간편결제 등
  status          TEXT          NOT NULL DEFAULT 'AUTH'
                                CHECK (status IN ('AUTH', 'CAPTURED', 'CANCELLED', 'FAILED')),
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  payment             IS '결제 — order 1건에 최소 1개';
COMMENT ON COLUMN payment.points_used IS '이미 차감된 포인트 수';
COMMENT ON COLUMN payment.pg_tx_id    IS 'PG사 거래 고유 ID (카드사 승인번호 등)';


-- ============================================================
-- 섹션 8: point_history (포인트 이력)
-- ============================================================
-- ERD: CUSTOMER ||--o{ POINT_HISTORY
-- customer_shop.point_balance 변경 시마다 이력 레코드 INSERT
CREATE TABLE IF NOT EXISTS point_history (
  history_id    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID         NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  store_id      UUID         NOT NULL REFERENCES store(store_id)       ON DELETE CASCADE,
  order_id      UUID         REFERENCES "order"(order_id) ON DELETE SET NULL,
  type          TEXT         NOT NULL
                             CHECK (type IN ('EARN', 'USE', 'EXPIRE', 'CANCEL', 'ADJUST')),
  amount        INT          NOT NULL,  -- 포인트 증감 (양수=적립, 음수=사용)
  balance_after INT          NOT NULL,  -- 처리 후 잔액
  note          VARCHAR(255),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  point_history        IS '포인트 이력 — customer_shop.point_balance 변경 감사';
COMMENT ON COLUMN point_history.amount IS '양수=적립, 음수=사용/차감';
COMMENT ON COLUMN point_history.type   IS 'EARN|USE|EXPIRE|CANCEL|ADJUST';


-- ============================================================
-- 섹션 9: memo (쇼핑메모)
-- ============================================================
-- ERD: CUSTOMER ||--o{ MEMO
-- 고객이 구매 전 재료/상품을 메모하는 기능 (AI 장보기 도우미)
CREATE TABLE IF NOT EXISTS memo (
  memo_id     UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID    NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  title       VARCHAR(120),
  note        TEXT,                     -- 메모 본문 (자유 텍스트)
  status      TEXT    NOT NULL DEFAULT 'ACTIVE'
                      CHECK (status IN ('ACTIVE', 'ARCHIVED', 'DELETED')),
  pinned      BOOLEAN NOT NULL DEFAULT false,   -- 상단 고정
  ai_context  JSONB,                    -- AI 프롬프트/컨텍스트 데이터
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  memo            IS '쇼핑메모 — AI 장보기 도우미 핵심 엔티티';
COMMENT ON COLUMN memo.ai_context IS 'AI 연동 시 프롬프트/컨텍스트 직렬화 데이터';


-- ============================================================
-- 섹션 10: memo_item (메모 아이템)
-- ============================================================
-- ERD: MEMO ||--o{ MEMO_ITEM
CREATE TABLE IF NOT EXISTS memo_item (
  memo_item_id     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  memo_id          UUID         NOT NULL REFERENCES memo(memo_id) ON DELETE CASCADE,
  raw_text         VARCHAR(200) NOT NULL,  -- 사용자가 입력한 원문 ("계란 2개")
  qty              VARCHAR(40),            -- 수량 텍스트 ("2개", "500g 등")
  note             VARCHAR(200),
  status           TEXT         NOT NULL DEFAULT 'OPEN'
                                CHECK (status IN ('OPEN', 'MATCHED', 'ADDED_TO_CART', 'DONE', 'REMOVED')),
  matched_item_id  UUID         REFERENCES item(item_id) ON DELETE SET NULL,
  matched_score    NUMERIC(5,2) CHECK (matched_score BETWEEN 0 AND 100),
  matched_payload  JSONB,       -- 후보 리스트, 임베딩 토큰 등
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  memo_item                  IS '쇼핑메모 아이템 — AI 상품 매칭 결과 포함';
COMMENT ON COLUMN memo_item.matched_item_id  IS 'AI가 매칭한 item.item_id (0-100 점수)';
COMMENT ON COLUMN memo_item.matched_payload  IS '후보 리스트, 토큰, 임베딩 등 직렬화';


-- ============================================================
-- 섹션 11: memo_recipe (레시피메모)
-- ============================================================
-- ERD: MEMO ||--o{ MEMO_RECIPE
CREATE TABLE IF NOT EXISTS memo_recipe (
  recipe_id     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  memo_id       UUID         NOT NULL REFERENCES memo(memo_id) ON DELETE CASCADE,
  title         VARCHAR(120) NOT NULL,
  servings      INT          CHECK (servings > 0),  -- 인분
  cook_time_min INT          CHECK (cook_time_min >= 0),  -- 조리시간(분)
  source        VARCHAR(120),             -- 책 제목 또는 링크 출처
  status        TEXT         NOT NULL DEFAULT 'DRAFT'
                             CHECK (status IN ('DRAFT', 'GENERATED', 'EDITED', 'ARCHIVED')),
  steps_json    JSONB,                    -- [{order: 1, text: "..."}, ...]
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  memo_recipe           IS '레시피메모 — AI가 생성하거나 사용자가 입력한 레시피';
COMMENT ON COLUMN memo_recipe.steps_json IS '[{order, text}] 배열 JSON';


-- ============================================================
-- 섹션 12: memo_recipe_ingredient (레시피 재료)
-- ============================================================
CREATE TABLE IF NOT EXISTS memo_recipe_ingredient (
  ingredient_id   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id       UUID         NOT NULL REFERENCES memo_recipe(recipe_id) ON DELETE CASCADE,
  name_raw        VARCHAR(120) NOT NULL,   -- 재료명 원문 ("다진 마늘")
  qty_text        VARCHAR(60),             -- 분량 텍스트 ("200g", "1T")
  optional        BOOLEAN      NOT NULL DEFAULT false,  -- 대체 가능 재료
  status          TEXT         NOT NULL DEFAULT 'OPEN'
                               CHECK (status IN ('OPEN', 'MATCHED', 'REMOVED')),
  matched_item_id UUID         REFERENCES item(item_id) ON DELETE SET NULL,
  matched_score   NUMERIC(5,2) CHECK (matched_score BETWEEN 0 AND 100),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  memo_recipe_ingredient             IS '레시피 재료 — item 매칭 포함';
COMMENT ON COLUMN memo_recipe_ingredient.matched_item_id IS '매칭된 item.item_id';


-- ============================================================
-- 섹션 13: 인덱스
-- ============================================================
-- customer
CREATE INDEX IF NOT EXISTS idx_customer_status     ON customer(status);

-- address
CREATE INDEX IF NOT EXISTS idx_address_customer    ON address(customer_id);
CREATE INDEX IF NOT EXISTS idx_address_status      ON address(status);

-- customer_shop
CREATE INDEX IF NOT EXISTS idx_cust_shop_store     ON customer_shop(store_id);

-- wishlist
CREATE INDEX IF NOT EXISTS idx_wishlist_item       ON wishlist(item_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_customer   ON wishlist(customer_id);

-- cart / cart_item
CREATE INDEX IF NOT EXISTS idx_cart_customer       ON cart(customer_id);
CREATE INDEX IF NOT EXISTS idx_cart_store          ON cart(store_id);
CREATE INDEX IF NOT EXISTS idx_cart_status         ON cart(status);
CREATE INDEX IF NOT EXISTS idx_cart_item_cart      ON cart_item(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_item_item      ON cart_item(item_id);

-- payment
CREATE INDEX IF NOT EXISTS idx_payment_order       ON payment(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_pg_tx       ON payment(pg_tx_id);
CREATE INDEX IF NOT EXISTS idx_payment_status      ON payment(status);

-- point_history
CREATE INDEX IF NOT EXISTS idx_point_cust_store    ON point_history(customer_id, store_id);
CREATE INDEX IF NOT EXISTS idx_point_order         ON point_history(order_id);
CREATE INDEX IF NOT EXISTS idx_point_created       ON point_history(created_at DESC);

-- memo
CREATE INDEX IF NOT EXISTS idx_memo_customer       ON memo(customer_id);
CREATE INDEX IF NOT EXISTS idx_memo_status         ON memo(status);

-- memo_item
CREATE INDEX IF NOT EXISTS idx_memo_item_memo      ON memo_item(memo_id);
CREATE INDEX IF NOT EXISTS idx_memo_item_matched   ON memo_item(matched_item_id) WHERE matched_item_id IS NOT NULL;

-- memo_recipe
CREATE INDEX IF NOT EXISTS idx_recipe_memo         ON memo_recipe(memo_id);

-- memo_recipe_ingredient
CREATE INDEX IF NOT EXISTS idx_ingredient_recipe   ON memo_recipe_ingredient(recipe_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_matched  ON memo_recipe_ingredient(matched_item_id) WHERE matched_item_id IS NOT NULL;


-- ============================================================
-- 섹션 14: RLS 활성화 + 서비스 역할 우회 정책
-- ============================================================
ALTER TABLE customer                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE address                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_shop            ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_item                ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_history            ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_item                ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_recipe              ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_recipe_ingredient   ENABLE ROW LEVEL SECURITY;

-- service_role (백엔드 관리자) 전체 접근 허용
CREATE POLICY "service_role_customer"     ON customer                FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_address"      ON address                 FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_cust_shop"    ON customer_shop           FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_wishlist"     ON wishlist                FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_cart"         ON cart                    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_cart_item"    ON cart_item               FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_payment"      ON payment                 FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_point_hist"   ON point_history           FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_memo"         ON memo                    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_memo_item"    ON memo_item               FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_memo_recipe"  ON memo_recipe             FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_ingredient"   ON memo_recipe_ingredient  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- authenticated 기본 읽기 허용 (본인 데이터 필터링은 앱 레이어 또는 추가 정책으로 처리)
CREATE POLICY "auth_read_customer"   ON customer        FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_address"    ON address         FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_cust_shop"  ON customer_shop   FOR SELECT TO authenticated USING (true);


-- ============================================================
-- 섹션 15: 기존 테이블 FK 보강 (주의: 실행 전 데이터 확인 필수)
-- ============================================================
-- [주의] 아래 ALTER TABLE은 기존 데이터가 있으면 USING 절 조정 필요.
--        데이터가 없는 경우(또는 개발 초기)에만 바로 실행 가능.
--        운영 DB에는 별도 마이그레이션으로 분리 권장.

-- 1. "order".address_id → address(address_id) FK 추가
--    현재 "order".address_id는 TEXT 타입 → UUID로 변경 필요
--
-- ALTER TABLE "order"
--   ALTER COLUMN address_id TYPE UUID USING address_id::UUID;
--
-- ALTER TABLE "order"
--   ADD CONSTRAINT fk_order_address
--     FOREIGN KEY (address_id) REFERENCES address(address_id) ON DELETE SET NULL;

-- 2. "order".customer_id → customer(customer_id) FK 추가
--    (현재 customer_id는 UUID이지만 FK 선언 없음)
--
-- ALTER TABLE "order"
--   ADD CONSTRAINT fk_order_customer
--     FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE SET NULL;

-- 3. review.customer_id → customer(customer_id) FK 추가 (있다면)
--
-- ALTER TABLE review
--   ADD CONSTRAINT fk_review_customer
--     FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE SET NULL;


-- ============================================================
-- 테이블 생성 완료 요약
-- ============================================================
-- 신규 생성 (12):
--   customer, address, customer_shop, wishlist,
--   cart, cart_item, payment, point_history,
--   memo, memo_item, memo_recipe, memo_recipe_ingredient
--
-- 인덱스 (24개): 각 FK 컬럼 + 자주 조회되는 필터 컬럼
--
-- RLS: 12개 테이블 모두 활성화 + service_role 우회 정책
--
-- 기존 테이블 FK 보강 (주석 처리, 별도 실행):
--   "order".address_id → address(address_id)  [타입 변환 포함]
--   "order".customer_id → customer(customer_id)
--   review.customer_id → customer(customer_id)
-- ============================================================
