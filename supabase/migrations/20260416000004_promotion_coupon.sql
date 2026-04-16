-- ============================================================
-- 마이그레이션 4: 프로모션 · 쿠폰
-- promotion, promotion_item, coupon, coupon_issurance, coupon_redemption
-- ============================================================

-- 프로모션
CREATE TABLE IF NOT EXISTS promotion (
  promo_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id         uuid NOT NULL REFERENCES store(store_id),
  name             text NOT NULL,
  type             text NOT NULL
                     CHECK (type IN (
                       'SALE','DISCOUNT_PCT','DISCOUNT_FIXED',
                       'ONE_PLUS_ONE','TWO_PLUS_ONE','BUNDLE'
                     )),
  discount_unit    text
                     CHECK (discount_unit IN ('PCT','FIXED')),
  discount_value   numeric,
  bundle_price     numeric,
  priority         integer NOT NULL DEFAULT 0,
  stackable        integer NOT NULL DEFAULT 0,
  flash_enabled    integer NOT NULL DEFAULT 0,
  flash_time_start text,
  flash_time_end   text,
  flash_dow_mask   text,
  max_usage        integer,
  per_user_limit   integer,
  start_at         timestamptz NOT NULL,
  end_at           timestamptz NOT NULL,
  status           text NOT NULL DEFAULT 'SCHEDULED'
                     CHECK (status IN ('SCHEDULED','ACTIVE','PAUSED','ENDED')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_promotion_store  ON promotion(store_id);
CREATE INDEX idx_promotion_status ON promotion(status);

-- 프로모션 상품
CREATE TABLE IF NOT EXISTS promotion_item (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_id        uuid NOT NULL REFERENCES promotion(promo_id),
  item_id         uuid NOT NULL REFERENCES item(item_id),
  condition_qty   integer,
  reward_qty      integer,
  reward_item_id  uuid REFERENCES item(item_id),
  limit_per_order integer,
  status          text NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','INACTIVE')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_promotion_item_promo ON promotion_item(promo_id);

-- 쿠폰
CREATE TABLE IF NOT EXISTS coupon (
  coupon_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id           uuid NOT NULL REFERENCES store(store_id),
  code               text NOT NULL DEFAULT '',
  name               text NOT NULL,
  coupon_type        text NOT NULL
                       CHECK (coupon_type IN ('DISCOUNT','SHIPPING_FREE','SIGNUP')),
  discount_unit      text NOT NULL
                       CHECK (discount_unit IN ('PCT','FIXED')),
  discount_value     numeric NOT NULL,
  shipping_max_free  numeric NOT NULL DEFAULT 0,
  min_order_amount   numeric NOT NULL DEFAULT 0,
  valid_from         timestamptz NOT NULL DEFAULT now(),
  valid_to           timestamptz NOT NULL,
  total_issuable     integer NOT NULL DEFAULT 0,
  per_customer_limit integer NOT NULL DEFAULT 0,
  stackable          integer NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now(),
  modified_at        timestamptz NOT NULL DEFAULT now(),
  status             text NOT NULL DEFAULT 'ISSUED'
                       CHECK (status IN ('ISSUED','USED','EXPIRED','CANCELLED'))
);

CREATE INDEX idx_coupon_store  ON coupon(store_id);
CREATE INDEX idx_coupon_status ON coupon(status);

-- 쿠폰 발급 (테이블명: coupon_issurance — ERD 원본 오타 유지)
CREATE TABLE IF NOT EXISTS coupon_issurance (
  issuance_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id     uuid NOT NULL REFERENCES coupon(coupon_id),
  customer_id   text,
  issued_at     timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz,
  issued_status text NOT NULL DEFAULT 'ISSUED'
                  CHECK (issued_status IN ('ISSUED','USED','EXPIRED','CANCELLED')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  modified_at   timestamptz NOT NULL DEFAULT now(),
  status        text
);

CREATE INDEX idx_coupon_issurance_coupon ON coupon_issurance(coupon_id);

-- 쿠폰 사용
CREATE TABLE IF NOT EXISTS coupon_redemption (
  redemption_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issuance_id     uuid NOT NULL REFERENCES coupon_issurance(issuance_id),
  order_id        uuid NOT NULL REFERENCES "order"(order_id),
  used_at         timestamptz NOT NULL DEFAULT now(),
  discount_amount numeric NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  modified_at     timestamptz NOT NULL DEFAULT now(),
  status          text NOT NULL DEFAULT 'APPLIED'
                    CHECK (status IN ('APPLIED','REVOKED','FAILED'))
);

CREATE INDEX idx_coupon_redemption_issuance ON coupon_redemption(issuance_id);
CREATE INDEX idx_coupon_redemption_order    ON coupon_redemption(order_id);
