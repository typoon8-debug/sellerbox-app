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
