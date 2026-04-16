-- ============================================================
-- 마이그레이션 1: 핵심 ID 테이블
-- tenant, users, seller, store, store_fulfillment, audit_log
-- ============================================================

-- 테넌트
CREATE TABLE IF NOT EXISTS tenant (
  tenant_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  status      text NOT NULL DEFAULT 'ACTIVE'
                CHECK (status IN ('ACTIVE','INACTIVE','SUSPENDED')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  modified_at timestamptz NOT NULL DEFAULT now()
);

-- 관리자 사용자
CREATE TABLE IF NOT EXISTS users (
  user_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id text NOT NULL UNIQUE,
  email        text NOT NULL UNIQUE,
  name         text NOT NULL,
  phone        text,
  role         text NOT NULL
                 CHECK (role IN ('CUSTOMER','SELLER','RIDER','ADMIN')),
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz
);

-- 가게
CREATE TABLE IF NOT EXISTS store (
  store_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          uuid NOT NULL REFERENCES tenant(tenant_id),
  name               text NOT NULL,
  store_category     text NOT NULL,
  address            text NOT NULL,
  store_picture      text,
  phone              text NOT NULL,
  contnet            text,                          -- ERD 원본 오타 유지
  min_delivery_price numeric NOT NULL,
  delivery_tip       numeric NOT NULL,
  min_delivery_time  integer,
  max_delivery_time  integer,
  points_enabled     integer NOT NULL DEFAULT 0,
  accrual_rate_pct   numeric,
  redeem_enabled     integer NOT NULL DEFAULT 0,
  min_redeem_unit    integer,
  max_redeem_rate_pct numeric,
  max_redeem_amount  numeric,
  expire_after_days  integer,
  rounding_mode      text,
  rating             numeric NOT NULL DEFAULT 0,
  dibs_count         integer NOT NULL DEFAULT 0,
  review_count       integer NOT NULL DEFAULT 0,
  operation_hours    text,
  closed_days        text,
  delivery_dddress   text,                          -- ERD 원본 오타 유지
  reg_number         text NOT NULL,
  jumin_number       text NOT NULL,
  ceo_name           text NOT NULL,
  reg_code           text NOT NULL DEFAULT '',
  fee                numeric NOT NULL,
  contract_start_at  timestamptz NOT NULL,
  contract_end_at    timestamptz NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  modified_at        timestamptz NOT NULL DEFAULT now(),
  status             text NOT NULL DEFAULT 'PENDING'
                       CHECK (status IN ('ACTIVE','INACTIVE','CLOSED','PENDING'))
);

CREATE INDEX idx_store_tenant ON store(tenant_id);
CREATE INDEX idx_store_status ON store(status);

-- 가게 풀필먼트
CREATE TABLE IF NOT EXISTS store_fulfillment (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id         uuid NOT NULL REFERENCES store(store_id),
  fulfillment_type text NOT NULL
                     CHECK (fulfillment_type IN (
                       'DELIVERY','PICKUP','BBQ','RESERVE',
                       'FRESH_MORNING','SAME_DAY','3P_DELIVERY','NONE'
                     )),
  active           boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_store_fulfillment_store ON store_fulfillment(store_id);

-- 판매원
CREATE TABLE IF NOT EXISTS seller (
  seller_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL,
  name       text NOT NULL,
  phone      text,
  role       text NOT NULL
               CHECK (role IN ('OWNER','MANAGER','PICKER','PACKER')),
  store_id   uuid NOT NULL REFERENCES store(store_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  is_active  text NOT NULL DEFAULT 'ACTIVE'
               CHECK (is_active IN ('ACTIVE','INACTIVE'))
);

CREATE INDEX idx_seller_store ON seller(store_id);
CREATE INDEX idx_seller_email ON seller(email);

-- 감사 로그
CREATE TABLE IF NOT EXISTS audit_log (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES users(user_id),
  action     text NOT NULL,
  resource   text NOT NULL,
  payload    jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
