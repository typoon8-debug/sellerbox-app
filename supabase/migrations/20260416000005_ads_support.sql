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
