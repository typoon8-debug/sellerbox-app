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
