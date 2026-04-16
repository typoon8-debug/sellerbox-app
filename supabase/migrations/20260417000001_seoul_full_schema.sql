-- ============================================================
-- 서울 리전 이관용 전체 스키마 (싱가포르 실제 DB 기준)
-- 생성일: 2026-04-17
-- 싱가포르 프로젝트: yfwbejswktamkgasdfeh
-- ============================================================

-- ─── 테넌트 ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenant (
  tenant_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar NOT NULL,
  code        varchar NOT NULL UNIQUE,
  type        varchar NOT NULL DEFAULT 'VENDOR',
  status      varchar NOT NULL DEFAULT 'ACTIVE',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── 사용자 ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  user_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         varchar NOT NULL UNIQUE,
  phone         varchar,
  password_hash varchar,
  name          varchar NOT NULL,
  role          varchar NOT NULL,
  tenant_id     uuid REFERENCES tenant(tenant_id),
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  auth_user_id  uuid
);

CREATE INDEX IF NOT EXISTS idx_users_email        ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role         ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id    ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- ─── 가게 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store (
  store_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          uuid NOT NULL REFERENCES tenant(tenant_id),
  name               text NOT NULL,
  store_category     text NOT NULL,
  address            text NOT NULL,
  store_picture      text,
  phone              text NOT NULL,
  contnet            text,
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
  delivery_dddress   text,
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
);

CREATE INDEX IF NOT EXISTS idx_store_tenant ON store(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_status ON store(status);

-- ─── 가게 풀필먼트 ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_fulfillment (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id         uuid NOT NULL REFERENCES store(store_id),
  fulfillment_type text NOT NULL,
  active           boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_store_fulfillment_store ON store_fulfillment(store_id);

-- ─── 판매원 ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seller (
  seller_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL,
  name       text NOT NULL,
  phone      text,
  role       text NOT NULL,
  store_id   uuid NOT NULL REFERENCES store(store_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  is_active  text NOT NULL DEFAULT 'ACTIVE'
);

CREATE INDEX IF NOT EXISTS idx_seller_store ON seller(store_id);
CREATE INDEX IF NOT EXISTS idx_seller_email ON seller(email);

-- ─── 감사 로그 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  log_id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES users(user_id),
  action     varchar NOT NULL,
  resource   varchar NOT NULL,
  payload    jsonb,
  ip         varchar,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user    ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user_id     ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at  ON audit_log(created_at DESC);

-- ─── 상품 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS item (
  item_id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id            uuid NOT NULL REFERENCES store(store_id),
  sku                 text NOT NULL,
  category_code_value text NOT NULL,
  category_name       text NOT NULL,
  name                text NOT NULL,
  list_price          numeric NOT NULL,
  sale_price          numeric NOT NULL,
  item_picture_url    text,
  ranking_yn          text NOT NULL DEFAULT 'N',
  ranking             integer NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  modified_at         timestamptz NOT NULL DEFAULT now(),
  status              text NOT NULL DEFAULT 'ACTIVE'
);

CREATE INDEX IF NOT EXISTS idx_item_store  ON item(store_id);
CREATE INDEX IF NOT EXISTS idx_item_sku    ON item(store_id, sku);
CREATE INDEX IF NOT EXISTS idx_item_status ON item(status);

-- ─── 상품 상세 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS item_detail (
  item_detail_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id                 uuid NOT NULL REFERENCES item(item_id),
  store_id                uuid NOT NULL REFERENCES store(store_id),
  description_short       text,
  item_img                text,
  item_thumbnail_small    text,
  item_thumbnail_big      text,
  item_detail_img_adv     text,
  item_detail_img_detail  text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  modified_at             timestamptz NOT NULL DEFAULT now(),
  status                  text NOT NULL DEFAULT 'ACTIVE'
);

CREATE INDEX IF NOT EXISTS idx_item_detail_item ON item_detail(item_id);

-- ─── 재고 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory (
  inventory_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id     uuid NOT NULL REFERENCES store(store_id),
  item_id      uuid NOT NULL REFERENCES item(item_id),
  on_hand      integer NOT NULL DEFAULT 0,
  reserved     integer NOT NULL DEFAULT 0,
  safety_stock integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  modified_at  timestamptz NOT NULL DEFAULT now(),
  status       text NOT NULL DEFAULT 'AVAILABLE',
  UNIQUE (store_id, item_id)
);

-- ─── 재고 트랜잭션 ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_txn (
  "txnId"          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id     uuid NOT NULL REFERENCES inventory(inventory_id),
  item_id          uuid NOT NULL REFERENCES item(item_id),
  store_id         uuid NOT NULL REFERENCES store(store_id),
  type             text NOT NULL,
  ref_type         text NOT NULL,
  ref_id           text NOT NULL,
  quantity         integer NOT NULL,
  before_quantity  integer NOT NULL,
  after_quantity   integer NOT NULL,
  reason           text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  modified_at      timestamptz NOT NULL DEFAULT now(),
  status           text NOT NULL DEFAULT 'PENDING'
);

CREATE INDEX IF NOT EXISTS idx_inv_txn_inventory ON inventory_txn(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inv_txn_store     ON inventory_txn(store_id);

-- ─── 주문 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "order" (
  order_id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id               uuid NOT NULL REFERENCES store(store_id),
  customer_id            text NOT NULL,
  address_id             text,
  order_no               text NOT NULL,
  payment_id             text,
  ordered_at             timestamptz NOT NULL DEFAULT now(),
  paid_at                timestamptz,
  discounted_total_price numeric NOT NULL,
  origin_total_price     numeric NOT NULL,
  delivery_method        text,
  quick_depart_date      text,
  quick_depart_time      text,
  ro_rider_id            text,
  delivery_fee           numeric NOT NULL DEFAULT 0,
  delivery_price         numeric NOT NULL,
  order_price            numeric NOT NULL,
  points_earned          integer NOT NULL DEFAULT 0,
  points_redeemed        integer NOT NULL DEFAULT 0,
  points_value_redeemed  integer NOT NULL DEFAULT 0,
  final_payable          numeric NOT NULL,
  requests               text,
  created_at             timestamptz NOT NULL DEFAULT now(),
  modified_at            timestamptz NOT NULL DEFAULT now(),
  status                 text NOT NULL DEFAULT 'CREATED'
);

CREATE INDEX IF NOT EXISTS idx_order_store    ON "order"(store_id);
CREATE INDEX IF NOT EXISTS idx_order_customer ON "order"(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_no       ON "order"(order_no);
CREATE INDEX IF NOT EXISTS idx_order_status   ON "order"(status);

-- ─── 주문 상품 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_item (
  order_detail_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid NOT NULL REFERENCES "order"(order_id),
  item_id         uuid NOT NULL REFERENCES item(item_id),
  qty             integer NOT NULL,
  unit_price      numeric NOT NULL,
  discount        numeric,
  line_total      numeric NOT NULL,
  status          text NOT NULL DEFAULT 'ORDERED',
  shipped_qty     integer,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz
);

CREATE INDEX IF NOT EXISTS idx_order_item_order ON order_item(order_id);

-- ─── 피킹 작업 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS picking_task (
  task_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES "order"(order_id),
  store_id     uuid NOT NULL REFERENCES store(store_id),
  picker_id    uuid REFERENCES seller(seller_id),
  status       text NOT NULL DEFAULT 'CREATED',
  created_at   timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_picking_task_order ON picking_task(order_id);
CREATE INDEX IF NOT EXISTS idx_picking_task_store ON picking_task(store_id);

-- ─── 피킹 상품 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS picking_item (
  picking_item_id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id             uuid NOT NULL REFERENCES picking_task(task_id),
  order_item_id       uuid NOT NULL REFERENCES order_item(order_detail_id),
  requested_qty       integer NOT NULL,
  picked_qty          integer NOT NULL DEFAULT 0,
  result              text NOT NULL DEFAULT 'OK',
  substitute_product_id uuid,
  memo                text
);

CREATE INDEX IF NOT EXISTS idx_picking_item_task ON picking_item(task_id);

-- ─── 패킹 작업 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS packing_task (
  pack_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       uuid NOT NULL REFERENCES "order"(order_id),
  packer_id      uuid REFERENCES seller(seller_id),
  status         text NOT NULL DEFAULT 'READY',
  packing_weight numeric,
  completed_at   timestamptz
);

CREATE INDEX IF NOT EXISTS idx_packing_task_order ON packing_task(order_id);

-- ─── 배송 라벨 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS label (
  label_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   uuid NOT NULL REFERENCES "order"(order_id),
  zpl_text   text NOT NULL,
  label_type text NOT NULL,
  printed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_label_order ON label(order_id);

-- ─── 배송 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shipment (
  shipment_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES "order"(order_id),
  tracking_no  text,
  method       text NOT NULL,
  store_id     uuid REFERENCES store(store_id),
  depart_date  text,
  depart_time  text,
  eta_min      integer,
  eta_max      integer,
  delivery_fee numeric NOT NULL DEFAULT 0,
  quote_id     text,
  status       text NOT NULL DEFAULT 'READY',
  rider_id     text,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipment_order  ON shipment(order_id);
CREATE INDEX IF NOT EXISTS idx_shipment_status ON shipment(status);

-- ─── 배송 이벤트 ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shipment_event (
  event_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipment(shipment_id),
  event_code  text NOT NULL,
  memo        text,
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipment_event_shipment ON shipment_event(shipment_id);

-- ─── 배송 요청 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dispatch_request (
  dispatch_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES "order"(order_id),
  store_id     uuid NOT NULL REFERENCES store(store_id),
  status       text NOT NULL DEFAULT 'REQUESTED',
  rider_id     text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  assigned_at  timestamptz
);

CREATE INDEX IF NOT EXISTS idx_dispatch_order ON dispatch_request(order_id);

-- ─── 바로퀵 정책 ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_quick_policy (
  policy_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id         uuid NOT NULL REFERENCES store(store_id),
  min_order_amount numeric NOT NULL DEFAULT 0,
  daily_runs       integer NOT NULL DEFAULT 0,
  capacity_per_slot integer NOT NULL DEFAULT 0,
  status           text NOT NULL DEFAULT 'ACTIVE',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quick_policy_store ON store_quick_policy(store_id);

-- ─── 바로퀵 타임슬롯 ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_quick_timeslot (
  slot_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        uuid NOT NULL REFERENCES store(store_id),
  label           text NOT NULL,
  depart_time     text NOT NULL,
  order_cutoff_min integer NOT NULL DEFAULT 0,
  dow_mask        text,
  status          text NOT NULL DEFAULT 'ACTIVE',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quick_timeslot_store ON store_quick_timeslot(store_id);

-- ─── 바로퀵 슬롯 사용량 ────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_quick_slot_usage (
  usage_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id       uuid NOT NULL REFERENCES store(store_id),
  depart_date    text NOT NULL,
  depart_time    text NOT NULL,
  reserved_count integer NOT NULL DEFAULT 0,
  UNIQUE (store_id, depart_date, depart_time)
);

-- ─── 프로모션 ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promotion (
  promo_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        uuid NOT NULL REFERENCES store(store_id),
  name            text NOT NULL,
  type            text NOT NULL,
  discount_unit   text,
  discount_value  numeric,
  bundle_price    numeric,
  priority        integer NOT NULL DEFAULT 0,
  stackable       integer NOT NULL DEFAULT 0,
  flash_enabled   integer NOT NULL DEFAULT 0,
  flash_time_start text,
  flash_time_end   text,
  flash_dow_mask   text,
  max_usage       integer,
  per_user_limit  integer,
  start_at        timestamptz NOT NULL,
  end_at          timestamptz NOT NULL,
  status          text NOT NULL DEFAULT 'SCHEDULED',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promotion_store  ON promotion(store_id);
CREATE INDEX IF NOT EXISTS idx_promotion_status ON promotion(status);

-- ─── 프로모션 상품 ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promotion_item (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_id       uuid NOT NULL REFERENCES promotion(promo_id),
  item_id        uuid NOT NULL REFERENCES item(item_id),
  condition_qty  integer,
  reward_qty     integer,
  reward_item_id uuid REFERENCES item(item_id),
  limit_per_order integer,
  status         text NOT NULL DEFAULT 'ACTIVE',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promotion_item_promo ON promotion_item(promo_id);

-- ─── 쿠폰 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupon (
  coupon_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id          uuid NOT NULL REFERENCES store(store_id),
  code              text NOT NULL DEFAULT '',
  name              text NOT NULL,
  coupon_type       text NOT NULL,
  discount_unit     text NOT NULL,
  discount_value    numeric NOT NULL,
  shipping_max_free numeric NOT NULL DEFAULT 0,
  min_order_amount  numeric NOT NULL DEFAULT 0,
  valid_from        timestamptz NOT NULL DEFAULT now(),
  valid_to          timestamptz NOT NULL,
  total_issuable    integer NOT NULL DEFAULT 0,
  per_customer_limit integer NOT NULL DEFAULT 0,
  stackable         integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  modified_at       timestamptz NOT NULL DEFAULT now(),
  status            text NOT NULL DEFAULT 'ISSUED'
);

CREATE INDEX IF NOT EXISTS idx_coupon_store  ON coupon(store_id);
CREATE INDEX IF NOT EXISTS idx_coupon_status ON coupon(status);

-- ─── 쿠폰 발급 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupon_issurance (
  issuance_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id     uuid NOT NULL REFERENCES coupon(coupon_id),
  customer_id   text,
  issued_at     timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz,
  issued_status text NOT NULL DEFAULT 'ISSUED',
  created_at    timestamptz NOT NULL DEFAULT now(),
  modified_at   timestamptz NOT NULL DEFAULT now(),
  status        text
);

CREATE INDEX IF NOT EXISTS idx_coupon_issurance_coupon ON coupon_issurance(coupon_id);

-- ─── 쿠폰 사용 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupon_redemption (
  redemption_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issuance_id    uuid NOT NULL REFERENCES coupon_issurance(issuance_id),
  order_id       uuid NOT NULL REFERENCES "order"(order_id),
  used_at        timestamptz NOT NULL DEFAULT now(),
  discount_amount numeric NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  modified_at    timestamptz NOT NULL DEFAULT now(),
  status         text NOT NULL DEFAULT 'APPLIED'
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemption_issuance ON coupon_redemption(issuance_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemption_order    ON coupon_redemption(order_id);

-- ─── 광고 콘텐츠 ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_ad_content (
  content_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id text NOT NULL,
  store_id     uuid NOT NULL REFERENCES store(store_id),
  title        text NOT NULL,
  ad_image     text,
  click_url    text,
  priority     integer NOT NULL DEFAULT 0,
  status       text NOT NULL DEFAULT 'DRAFT',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fp_ad_content_store ON fp_ad_content(store_id);

-- ─── 광고 일정 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_ad_schedule (
  schedule_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id  uuid NOT NULL REFERENCES fp_ad_content(content_id),
  store_id    uuid NOT NULL REFERENCES store(store_id),
  start_at    timestamptz NOT NULL,
  end_at      timestamptz NOT NULL,
  time_start  text,
  time_end    text,
  dow_mask    text,
  timezone    text,
  status      text NOT NULL DEFAULT 'SCHEDULED',
  weight      integer
);

CREATE INDEX IF NOT EXISTS idx_fp_ad_schedule_content ON fp_ad_schedule(content_id);

-- ─── 광고 타겟 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_ad_target (
  target_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id      uuid NOT NULL REFERENCES fp_ad_content(content_id),
  store_id        uuid NOT NULL REFERENCES store(store_id),
  os              text,
  app_version_min text,
  app_version_max text,
  locale          text,
  region          text,
  user_segment    text,
  status          text NOT NULL DEFAULT 'ACTIVE'
);

CREATE INDEX IF NOT EXISTS idx_fp_ad_target_content ON fp_ad_target(content_id);

-- ─── 광고 한도 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_ad_cap (
  cap_id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id                  uuid NOT NULL REFERENCES fp_ad_content(content_id),
  store_id                    uuid NOT NULL REFERENCES store(store_id),
  max_impressions_total        integer,
  max_impressions_per_user_day integer,
  max_clicks_total             integer,
  status                      text NOT NULL DEFAULT 'ACTIVE',
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fp_ad_cap_content ON fp_ad_cap(content_id);

-- ─── 광고 로그 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_ad_log (
  log_id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES fp_ad_content(content_id),
  store_id   uuid NOT NULL REFERENCES store(store_id),
  user_id    text,
  device_id  text,
  action     text NOT NULL,
  page       text NOT NULL,
  area_key   text NOT NULL,
  ts         timestamptz NOT NULL DEFAULT now(),
  ip         text,
  ua         text
);

CREATE INDEX IF NOT EXISTS idx_fp_ad_log_content ON fp_ad_log(content_id);
CREATE INDEX IF NOT EXISTS idx_fp_ad_log_ts      ON fp_ad_log(ts DESC);

-- ─── 광고 플레이스먼트 ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_ad_placement (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid NOT NULL REFERENCES tenant(tenant_id),
  position   varchar NOT NULL,
  image_url  text,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_tenant_id ON fp_ad_placement(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ad_is_active ON fp_ad_placement(tenant_id, is_active);

-- ─── CS 티켓 ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cs_ticket (
  ticket_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES "order"(order_id),
  customer_id text NOT NULL,
  type        text NOT NULL,
  cs_contents text NOT NULL,
  cs_action   text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  modified_at timestamptz NOT NULL DEFAULT now(),
  status      text NOT NULL DEFAULT 'OPEN'
);

CREATE INDEX IF NOT EXISTS idx_cs_ticket_order  ON cs_ticket(order_id);
CREATE INDEX IF NOT EXISTS idx_cs_ticket_status ON cs_ticket(status);

-- ─── 리뷰 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS review (
  review_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id          uuid NOT NULL REFERENCES store(store_id),
  customer_id       text NOT NULL,
  item_id           uuid REFERENCES item(item_id),
  rating            integer NOT NULL,
  content           text,
  review_picture_url text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  modified_at       timestamptz NOT NULL DEFAULT now(),
  status            text NOT NULL DEFAULT 'VISIBLE'
);

CREATE INDEX IF NOT EXISTS idx_review_store ON review(store_id);

-- ─── CEO 답변 ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ceo_review (
  "ceo_reviewId" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "reviewId"     uuid NOT NULL REFERENCES review(review_id),
  content        text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  modified_at    timestamptz NOT NULL DEFAULT now(),
  status         text NOT NULL DEFAULT 'VISIBLE'
);

CREATE INDEX IF NOT EXISTS idx_ceo_review_review ON ceo_review("reviewId");

-- ─── 공통 코드 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS common_code (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        varchar NOT NULL UNIQUE,
  name        varchar NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS common_code_value (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  common_code_id uuid NOT NULL REFERENCES common_code(id),
  value          varchar NOT NULL,
  label          varchar NOT NULL,
  sort_order     integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (common_code_id, value)
);

CREATE INDEX IF NOT EXISTS idx_ccv_common_code_id ON common_code_value(common_code_id);
CREATE INDEX IF NOT EXISTS idx_ccv_sort_order     ON common_code_value(common_code_id, sort_order);

-- ─── 사용자 동의 ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS consent (
  consent_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(user_id),
  type       varchar NOT NULL,
  version    varchar,
  agreed     boolean NOT NULL DEFAULT false,
  agreed_at  timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── 디바이스 ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS device (
  device_id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(user_id),
  platform      varchar NOT NULL,
  push_token    varchar,
  app_version   varchar,
  registered_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_device_user_id ON device(user_id);

-- ─── 알림 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification (
  noti_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(user_id),
  channel    varchar NOT NULL,
  title      varchar NOT NULL,
  body       text NOT NULL,
  status     varchar NOT NULL DEFAULT 'QUEUED',
  sent_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_user_id ON notification(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_status  ON notification(status);

-- ─── OAuth 토큰 ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS oauth_token (
  token_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(user_id),
  provider      varchar NOT NULL,
  access_token  text NOT NULL,
  refresh_token text,
  expires_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oauth_user_id ON oauth_token(user_id);

-- ─── OTP 요청 ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_request (
  otp_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       varchar NOT NULL,
  name        varchar NOT NULL,
  otp_code    char NOT NULL,
  expires_at  timestamptz NOT NULL,
  verified    boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  request_ip  varchar,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── 계좌 인증 로그 ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bank_account_verify_log (
  verify_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES users(user_id),
  bank_code        varchar NOT NULL,
  bank_name        varchar NOT NULL,
  account_no       varchar NOT NULL,
  account_holder   varchar NOT NULL,
  verified         boolean NOT NULL DEFAULT false,
  verified_at      timestamptz,
  response_code    varchar,
  response_message varchar,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ─── 메시지 스레드 ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS message_thread (
  thread_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       uuid NOT NULL,
  shipment_id    uuid,
  customer_id    uuid REFERENCES users(user_id),
  seller_id      uuid REFERENCES users(user_id),
  rider_id       uuid REFERENCES users(user_id),
  status         varchar NOT NULL DEFAULT 'ACTIVE',
  last_message_at timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_thread_order_id ON message_thread(order_id);
CREATE INDEX IF NOT EXISTS idx_thread_status   ON message_thread(status);

-- ─── 메시지 ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS message (
  msg_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id    uuid NOT NULL REFERENCES message_thread(thread_id),
  sender_type  varchar NOT NULL,
  sender_id    uuid NOT NULL,
  content      text NOT NULL,
  content_type varchar NOT NULL DEFAULT 'TEXT',
  is_read      boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_message_thread_id  ON message(thread_id);
CREATE INDEX IF NOT EXISTS idx_message_created_at ON message(thread_id, created_at DESC);

-- ─── 로그인 로그 ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_login_log (
  log_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(user_id),
  user_role   varchar,
  login_ip    varchar,
  user_agent  text,
  success     boolean NOT NULL DEFAULT false,
  fail_reason varchar,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_user_id ON user_login_log(user_id);

-- ─── Storage 버킷 ───────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'item-images',
  'item-images',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage 정책
CREATE POLICY "item-images 공개 읽기"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'item-images');

CREATE POLICY "item-images 인증 업로드"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'item-images' AND auth.role() = 'authenticated');

CREATE POLICY "item-images 인증 수정"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'item-images' AND auth.role() = 'authenticated');

CREATE POLICY "item-images 인증 삭제"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'item-images' AND auth.role() = 'authenticated');

-- ─── RLS 활성화 ────────────────────────────────────────────
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
ALTER TABLE fp_ad_placement     ENABLE ROW LEVEL SECURITY;
ALTER TABLE cs_ticket           ENABLE ROW LEVEL SECURITY;
ALTER TABLE review              ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceo_review          ENABLE ROW LEVEL SECURITY;
ALTER TABLE common_code         ENABLE ROW LEVEL SECURITY;
ALTER TABLE common_code_value   ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent             ENABLE ROW LEVEL SECURITY;
ALTER TABLE device              ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification        ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_token         ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_request         ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_account_verify_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_thread      ENABLE ROW LEVEL SECURITY;
ALTER TABLE message             ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_login_log      ENABLE ROW LEVEL SECURITY;

-- ─── RLS 정책 (인증 사용자 읽기) ───────────────────────────
CREATE POLICY "authenticated 읽기" ON tenant             FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON users              FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON store              FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON store_fulfillment  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON seller             FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON item               FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON item_detail        FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON inventory          FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON inventory_txn      FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON "order"            FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON order_item         FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON picking_task       FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON picking_item       FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON packing_task       FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON shipment           FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON shipment_event     FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON dispatch_request   FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON promotion          FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON promotion_item     FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON coupon             FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON coupon_issurance   FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON fp_ad_content      FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON fp_ad_schedule     FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON fp_ad_target       FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON fp_ad_cap          FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON fp_ad_placement    FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON review             FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON ceo_review         FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON common_code        FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON common_code_value  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON store_quick_policy    FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON store_quick_timeslot  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated 읽기" ON store_quick_slot_usage FOR SELECT TO authenticated USING (true);

-- ─── RLS 정책 (익명 사용자 공개 데이터) ────────────────────
CREATE POLICY "anon 공개 읽기" ON store   FOR SELECT TO anon USING (status = 'ACTIVE');
CREATE POLICY "anon 공개 읽기" ON item    FOR SELECT TO anon USING (status = 'ACTIVE');
CREATE POLICY "anon 공개 읽기" ON review  FOR SELECT TO anon USING (status = 'VISIBLE');

-- ─── PostgREST 롤 권한 (DROP SCHEMA 후 재부여 필요) ───────────
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
