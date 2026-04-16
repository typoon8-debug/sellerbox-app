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
-- ============================================================
-- 마이그레이션 2: 상품 · 재고
-- item, item_detail, inventory, inventory_txn
-- ============================================================

-- 상품
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
                        CHECK (status IN ('ACTIVE','INACTIVE','OUT_OF_STOCK','DISCONTINUED'))
);

CREATE INDEX idx_item_store ON item(store_id);
CREATE INDEX idx_item_sku   ON item(store_id, sku);
CREATE INDEX idx_item_status ON item(status);

-- 상품 상세
CREATE TABLE IF NOT EXISTS item_detail (
  item_detail_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id              uuid NOT NULL REFERENCES item(item_id),
  store_id             uuid NOT NULL REFERENCES store(store_id),
  description_short    text,
  item_img             text,
  item_thumbnail_small text,
  item_thumbnail_big   text,
  item_detail_img_adv  text,
  item_detail_img_detail text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  modified_at          timestamptz NOT NULL DEFAULT now(),
  status               text NOT NULL DEFAULT 'ACTIVE'
                         CHECK (status IN ('ACTIVE','INACTIVE'))
);

CREATE INDEX idx_item_detail_item ON item_detail(item_id);

-- 재고
CREATE TABLE IF NOT EXISTS inventory (
  inventory_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id     uuid NOT NULL REFERENCES store(store_id),
  item_id      uuid NOT NULL REFERENCES item(item_id),
  on_hand      integer NOT NULL DEFAULT 0,
  reserved     integer NOT NULL DEFAULT 0,
  safety_stock integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  modified_at  timestamptz NOT NULL DEFAULT now(),
  status       text NOT NULL DEFAULT 'AVAILABLE'
                 CHECK (status IN ('AVAILABLE','RESERVED','DAMAGED','ADJUSTED'))
);

CREATE UNIQUE INDEX idx_inventory_store_item ON inventory(store_id, item_id);

-- 재고 트랜잭션 (PK: txnId — ERD 원본 camelCase 유지)
CREATE TABLE IF NOT EXISTS inventory_txn (
  "txnId"          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id     uuid NOT NULL REFERENCES inventory(inventory_id),
  item_id          uuid NOT NULL REFERENCES item(item_id),
  store_id         uuid NOT NULL REFERENCES store(store_id),
  type             text NOT NULL
                     CHECK (type IN ('INBOUND','OUTBOUND','ADJUST','RESERVE','RELEASE','RETURN')),
  ref_type         text NOT NULL,
  ref_id           text NOT NULL,
  quantity         integer NOT NULL,
  before_quantity  integer NOT NULL,
  after_quantity   integer NOT NULL,
  reason           text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  modified_at      timestamptz NOT NULL DEFAULT now(),
  status           text NOT NULL DEFAULT 'PENDING'
                     CHECK (status IN ('PENDING','COMPLETED','CANCELLED','FAILED'))
);

CREATE INDEX idx_inv_txn_inventory ON inventory_txn(inventory_id);
CREATE INDEX idx_inv_txn_store     ON inventory_txn(store_id);
-- ============================================================
-- 마이그레이션 3: 주문 · 풀필먼트
-- order, order_item, picking_task, picking_item, packing_task,
-- label, shipment, shipment_event, dispatch_request,
-- store_quick_policy, store_quick_timeslot, store_quick_slot_usage
-- ============================================================

-- 주문 ("order"는 예약어이므로 따옴표 사용)
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
  delivery_method        text
                           CHECK (delivery_method IN (
                             'DELIVERY','BBQ','PICKUP','RESERVE',
                             'FRESH_MORNING','SAME_DAY','3P_DELIVERY'
                           )),
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
                           CHECK (status IN (
                             'CREATED','PAID','PACKING','DISPATCHED',
                             'DELIVERING','DELIVERED','CANCELED','REFUNDED'
                           ))
);

CREATE INDEX idx_order_store    ON "order"(store_id);
CREATE INDEX idx_order_customer ON "order"(customer_id);
CREATE INDEX idx_order_status   ON "order"(status);
CREATE INDEX idx_order_no       ON "order"(order_no);

-- 주문 상품
CREATE TABLE IF NOT EXISTS order_item (
  order_detail_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid NOT NULL REFERENCES "order"(order_id),
  item_id         uuid NOT NULL REFERENCES item(item_id),
  qty             integer NOT NULL,
  unit_price      numeric NOT NULL,
  discount        numeric,
  line_total      numeric NOT NULL,
  status          text NOT NULL DEFAULT 'ORDERED'
                    CHECK (status IN ('ORDERED','PACKING','SHIPPED','DELIVERED','CANCELED')),
  shipped_qty     integer,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz
);

CREATE INDEX idx_order_item_order ON order_item(order_id);

-- 피킹 작업
CREATE TABLE IF NOT EXISTS picking_task (
  task_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES "order"(order_id),
  store_id     uuid NOT NULL REFERENCES store(store_id),
  picker_id    uuid REFERENCES seller(seller_id),
  status       text NOT NULL DEFAULT 'CREATED'
                 CHECK (status IN ('CREATED','PICKING','PICKED','FAILED')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_picking_task_order ON picking_task(order_id);
CREATE INDEX idx_picking_task_store ON picking_task(store_id);

-- 피킹 상품
CREATE TABLE IF NOT EXISTS picking_item (
  picking_item_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id               uuid NOT NULL REFERENCES picking_task(task_id),
  order_item_id         uuid NOT NULL REFERENCES order_item(order_detail_id),
  requested_qty         integer NOT NULL,
  picked_qty            integer NOT NULL DEFAULT 0,
  result                text NOT NULL DEFAULT 'OK'
                          CHECK (result IN ('OK','SHORT','SUBSTITUTE')),
  substitute_product_id uuid,
  memo                  text
);

CREATE INDEX idx_picking_item_task ON picking_item(task_id);

-- 패킹 작업
CREATE TABLE IF NOT EXISTS packing_task (
  pack_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       uuid NOT NULL REFERENCES "order"(order_id),
  packer_id      uuid REFERENCES seller(seller_id),
  status         text NOT NULL DEFAULT 'READY'
                   CHECK (status IN ('READY','PACKING','PACKED')),
  packing_weight numeric,
  completed_at   timestamptz
);

CREATE INDEX idx_packing_task_order ON packing_task(order_id);

-- 라벨
CREATE TABLE IF NOT EXISTS label (
  label_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   uuid NOT NULL REFERENCES "order"(order_id),
  zpl_text   text NOT NULL,
  label_type text NOT NULL
               CHECK (label_type IN ('BOX','BAG','INVOICE')),
  printed_at timestamptz
);

CREATE INDEX idx_label_order ON label(order_id);

-- 배송
CREATE TABLE IF NOT EXISTS shipment (
  shipment_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES "order"(order_id),
  tracking_no  text,
  method       text NOT NULL
                 CHECK (method IN ('QUICK','RO_ONDEMAND')),
  store_id     uuid REFERENCES store(store_id),
  depart_date  text,
  depart_time  text,
  eta_min      integer,
  eta_max      integer,
  delivery_fee numeric NOT NULL DEFAULT 0,
  quote_id     text,
  status       text NOT NULL DEFAULT 'READY'
                 CHECK (status IN (
                   'READY','ASSIGNED','PICKED_UP','OUT_FOR_DELIVERY',
                   'DELIVERED','FAILED','SCHEDULED'
                 )),
  rider_id     text,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipment_order ON shipment(order_id);
CREATE INDEX idx_shipment_status ON shipment(status);

-- 배송 이벤트
CREATE TABLE IF NOT EXISTS shipment_event (
  event_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipment(shipment_id),
  event_code  text NOT NULL
                CHECK (event_code IN (
                  'ASSIGNED','OUT','ARRIVED','FAILED',
                  'PROOF_UPLOADED','SCHEDULED','VEHICLE_DEPARTED'
                )),
  memo        text,
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipment_event_shipment ON shipment_event(shipment_id);

-- 배송 요청
CREATE TABLE IF NOT EXISTS dispatch_request (
  dispatch_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES "order"(order_id),
  store_id     uuid NOT NULL REFERENCES store(store_id),
  status       text NOT NULL DEFAULT 'REQUESTED'
                 CHECK (status IN ('REQUESTED','ASSIGNED','CANCELLED')),
  rider_id     text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  assigned_at  timestamptz
);

CREATE INDEX idx_dispatch_order ON dispatch_request(order_id);

-- 바로퀵 정책
CREATE TABLE IF NOT EXISTS store_quick_policy (
  policy_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id          uuid NOT NULL REFERENCES store(store_id),
  min_order_amount  numeric NOT NULL DEFAULT 0,
  daily_runs        integer NOT NULL DEFAULT 0,
  capacity_per_slot integer NOT NULL DEFAULT 0,
  status            text NOT NULL DEFAULT 'ACTIVE'
                      CHECK (status IN ('ACTIVE','INACTIVE')),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_quick_policy_store ON store_quick_policy(store_id);

-- 바로퀵 타임슬롯
CREATE TABLE IF NOT EXISTS store_quick_timeslot (
  slot_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id         uuid NOT NULL REFERENCES store(store_id),
  label            text NOT NULL,
  depart_time      text NOT NULL,
  order_cutoff_min integer NOT NULL DEFAULT 0,
  dow_mask         text,
  status           text NOT NULL DEFAULT 'ACTIVE'
                     CHECK (status IN ('ACTIVE','INACTIVE')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_quick_timeslot_store ON store_quick_timeslot(store_id);

-- 바로퀵 슬롯 사용량
CREATE TABLE IF NOT EXISTS store_quick_slot_usage (
  usage_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id       uuid NOT NULL REFERENCES store(store_id),
  depart_date    text NOT NULL,
  depart_time    text NOT NULL,
  reserved_count integer NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX idx_slot_usage_unique ON store_quick_slot_usage(store_id, depart_date, depart_time);
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
-- ============================================================
-- 마이그레이션 5: 광고 · CS · 리뷰
-- fp_ad_content, fp_ad_schedule, fp_ad_target, fp_ad_cap,
-- fp_ad_log, cs_ticket, review, ceo_review
-- ============================================================

-- 광고 콘텐츠
CREATE TABLE IF NOT EXISTS fp_ad_content (
  content_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id text NOT NULL,
  store_id     uuid NOT NULL REFERENCES store(store_id),
  title        text NOT NULL,
  ad_image     text,
  click_url    text,
  priority     integer NOT NULL DEFAULT 0,
  status       text NOT NULL DEFAULT 'DRAFT'
                 CHECK (status IN ('DRAFT','READY','ACTIVE','PAUSED','ENDED')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fp_ad_content_store ON fp_ad_content(store_id);

-- 광고 일정
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
  status      text NOT NULL DEFAULT 'SCHEDULED'
                CHECK (status IN ('SCHEDULED','ACTIVE','PAUSED','ENDED')),
  weight      integer
);

CREATE INDEX idx_fp_ad_schedule_content ON fp_ad_schedule(content_id);

-- 광고 타겟
CREATE TABLE IF NOT EXISTS fp_ad_target (
  target_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id      uuid NOT NULL REFERENCES fp_ad_content(content_id),
  store_id        uuid NOT NULL REFERENCES store(store_id),
  os              text CHECK (os IN ('IOS','ANDROID','WEB')),
  app_version_min text,
  app_version_max text,
  locale          text,
  region          text,
  user_segment    text,
  status          text NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','INACTIVE'))
);

CREATE INDEX idx_fp_ad_target_content ON fp_ad_target(content_id);

-- 광고 한도
CREATE TABLE IF NOT EXISTS fp_ad_cap (
  cap_id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id                  uuid NOT NULL REFERENCES fp_ad_content(content_id),
  store_id                    uuid NOT NULL REFERENCES store(store_id),
  max_impressions_total       integer,
  max_impressions_per_user_day integer,
  max_clicks_total            integer,
  status                      text NOT NULL DEFAULT 'ACTIVE'
                                CHECK (status IN ('ACTIVE','INACTIVE')),
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fp_ad_cap_content ON fp_ad_cap(content_id);

-- 광고 로그
CREATE TABLE IF NOT EXISTS fp_ad_log (
  log_id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES fp_ad_content(content_id),
  store_id   uuid NOT NULL REFERENCES store(store_id),
  user_id    text,
  device_id  text,
  action     text NOT NULL
               CHECK (action IN ('IMPRESSION','CLICK')),
  page       text NOT NULL
               CHECK (page IN ('HOME','WEEKLY_SALE')),
  area_key   text NOT NULL
               CHECK (area_key IN ('HERO','MID_1','MID_2','FOOTER')),
  ts         timestamptz NOT NULL DEFAULT now(),
  ip         text,
  ua         text
);

CREATE INDEX idx_fp_ad_log_content ON fp_ad_log(content_id);
CREATE INDEX idx_fp_ad_log_ts      ON fp_ad_log(ts DESC);

-- CS 티켓
CREATE TABLE IF NOT EXISTS cs_ticket (
  ticket_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES "order"(order_id),
  customer_id text NOT NULL,
  type        text NOT NULL
                CHECK (type IN ('REFUND','EXCHANGE','INQUIRY')),
  cs_contents text NOT NULL,
  cs_action   text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  modified_at timestamptz NOT NULL DEFAULT now(),
  status      text NOT NULL DEFAULT 'OPEN'
                CHECK (status IN ('OPEN','IN_PROGRESS','CLOSED'))
);

CREATE INDEX idx_cs_ticket_order ON cs_ticket(order_id);
CREATE INDEX idx_cs_ticket_status ON cs_ticket(status);

-- 리뷰
CREATE TABLE IF NOT EXISTS review (
  review_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id           uuid NOT NULL REFERENCES store(store_id),
  customer_id        text NOT NULL,
  item_id            uuid REFERENCES item(item_id),
  rating             integer NOT NULL,
  content            text,
  review_picture_url text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  modified_at        timestamptz NOT NULL DEFAULT now(),
  status             text NOT NULL DEFAULT 'VISIBLE'
                       CHECK (status IN ('VISIBLE','HIDDEN','REPORTED','DELETED'))
);

CREATE INDEX idx_review_store ON review(store_id);

-- CEO 답변 (PK: ceo_reviewId, FK: reviewId — ERD 원본 camelCase 유지)
CREATE TABLE IF NOT EXISTS ceo_review (
  "ceo_reviewId" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "reviewId"     uuid NOT NULL REFERENCES review(review_id),
  content        text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  modified_at    timestamptz NOT NULL DEFAULT now(),
  status         text NOT NULL DEFAULT 'VISIBLE'
                   CHECK (status IN ('VISIBLE','HIDDEN','DELETED'))
);

CREATE INDEX idx_ceo_review_review ON ceo_review("reviewId");
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
-- ============================================================
-- 시드 데이터: 기본 테넌트, 관리자 사용자, 판매원, 가게
-- E2E 테스트 시드(e2e/fixtures/seed.ts)와 ID가 일치하도록 고정 UUID 사용
-- ============================================================

-- 테넌트
INSERT INTO tenant (tenant_id, name, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Sellerbox', 'ACTIVE')
ON CONFLICT (tenant_id) DO NOTHING;

-- 관리자 사용자 (auth_user_id는 Supabase Auth에서 생성 후 업데이트)
INSERT INTO users (user_id, auth_user_id, email, name, role, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'placeholder-auth-id',
  'typoon8@gmail.com',
  '관리자',
  'ADMIN',
  true
)
ON CONFLICT (user_id) DO NOTHING;

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
