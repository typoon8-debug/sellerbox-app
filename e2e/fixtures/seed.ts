/**
 * E2E 테스트용 시드 데이터 생성 및 정리 유틸리티
 *
 * Supabase 로컬 인스턴스와 연동하여 테스트 데이터를 생성하고,
 * 테스트 완료 후 cleanup을 수행합니다.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/supabase/database.types";

// ─── 환경 변수 ────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "test-service-role-key";

// ─── 테스트 계정 상수 ─────────────────────────────────────────────────────────
export const TEST_CREDENTIALS = {
  OWNER: {
    email: "typoon8@gmail.com",
    password: "chan1026*$*",
  },
  ADMIN: {
    email: "typoon8@gmail.com",
    password: "chan1026*$*",
  },
} as const;

// ─── 시드 데이터 ID 상수 (UUID v4 고정값 — 항상 동일하게 정리 가능) ──────────
export const SEED_IDS = {
  TENANT_ID: "11111111-0000-4000-a000-000000000001",
  STORE_ID: "22222222-0000-4000-a000-000000000001",
  ITEM_ID: "33333333-0000-4000-a000-000000000001",
  INVENTORY_ID: "44444444-0000-4000-a000-000000000001",
  PROMOTION_ID: "55555555-0000-4000-a000-000000000001",
  COUPON_ID: "66666666-0000-4000-a000-000000000001",
  ORDER_ID: "77777777-0000-4000-a000-000000000001",
  PICKING_TASK_ID: "88888888-0000-4000-a000-000000000001",
  PACKING_TASK_ID: "99999999-0000-4000-a000-000000000001",
  LABEL_ID: "aaaaaaaa-0000-4000-a000-000000000001",
  CS_TICKET_ID: "bbbbbbbb-0000-4000-a000-000000000001",
  REVIEW_ID: "cccccccc-0000-4000-a000-000000000001",
} as const;

// ─── Supabase 서비스 롤 클라이언트 ────────────────────────────────────────────
export function createServiceClient(): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ─── 테스트 데이터 생성 함수 ──────────────────────────────────────────────────

/**
 * 테스트용 가게 데이터 생성
 */
export async function seedStore(client: SupabaseClient<Database>): Promise<void> {
  await client.from("store").upsert(
    {
      store_id: SEED_IDS.STORE_ID,
      tenant_id: SEED_IDS.TENANT_ID,
      name: "[E2E] 테스트 가게",
      store_category: "GENERAL",
      address: "서울시 강남구 테헤란로 1",
      phone: "02-0000-0001",
      min_delivery_price: 15000,
      delivery_tip: 3000,
      reg_number: "123-45-67890",
      jumin_number: "900101-1000000",
      ceo_name: "홍길동",
      fee: 3.5,
      contract_start_at: "2024-01-01",
      contract_end_at: "2025-12-31",
      status: "ACTIVE",
    },
    { onConflict: "store_id" }
  );
}

/**
 * 테스트용 상품 및 재고 데이터 생성
 */
export async function seedItem(client: SupabaseClient<Database>): Promise<void> {
  // 상품 생성
  await client.from("item").upsert(
    {
      item_id: SEED_IDS.ITEM_ID,
      store_id: SEED_IDS.STORE_ID,
      sku: "E2E-SKU-001",
      category_code_value: "FRESH",
      category_name: "신선식품",
      name: "[E2E] 테스트 상품",
      list_price: 10000,
      sale_price: 8000,
      ranking_yn: "N",
      ranking: 0,
      status: "ACTIVE",
    },
    { onConflict: "item_id" }
  );

  // 재고 생성
  await client.from("inventory").upsert(
    {
      inventory_id: SEED_IDS.INVENTORY_ID,
      item_id: SEED_IDS.ITEM_ID,
      store_id: SEED_IDS.STORE_ID,
      on_hand: 100,
      reserved: 0,
      status: "AVAILABLE",
    },
    { onConflict: "inventory_id" }
  );
}

/**
 * 테스트용 주문 데이터 생성
 */
export async function seedOrder(client: SupabaseClient<Database>): Promise<void> {
  await client.from("order").upsert(
    {
      order_id: SEED_IDS.ORDER_ID,
      store_id: SEED_IDS.STORE_ID,
      customer_id: "00000000-0000-4000-a000-000000000099",
      order_no: "E2E-ORDER-001",
      status: "PAID",
      discounted_total_price: 8000,
      origin_total_price: 10000,
      delivery_method: "DELIVERY",
      delivery_price: 3000,
      order_price: 8000,
      final_payable: 8000,
    },
    { onConflict: "order_id" }
  );
}

/**
 * 테스트용 피킹 작업 데이터 생성
 */
export async function seedPickingTask(client: SupabaseClient<Database>): Promise<void> {
  await client.from("picking_task").upsert(
    {
      task_id: SEED_IDS.PICKING_TASK_ID,
      order_id: SEED_IDS.ORDER_ID,
      store_id: SEED_IDS.STORE_ID,
      status: "CREATED",
    },
    { onConflict: "task_id" }
  );
}

/**
 * 테스트용 프로모션 데이터 생성
 */
export async function seedPromotion(client: SupabaseClient<Database>): Promise<void> {
  await client.from("promotion").upsert(
    {
      promo_id: SEED_IDS.PROMOTION_ID,
      store_id: SEED_IDS.STORE_ID,
      name: "[E2E] 테스트 프로모션",
      type: "DISCOUNT_PCT",
      discount_unit: "PCT",
      discount_value: 10,
      priority: 1,
      stackable: 0,
      flash_enabled: 0,
      start_at: "2024-01-01T00:00:00Z",
      end_at: "2025-12-31T23:59:59Z",
      status: "ACTIVE",
    },
    { onConflict: "promo_id" }
  );
}

/**
 * 테스트용 쿠폰 데이터 생성
 */
export async function seedCoupon(client: SupabaseClient<Database>): Promise<void> {
  await client.from("coupon").upsert(
    {
      coupon_id: SEED_IDS.COUPON_ID,
      store_id: SEED_IDS.STORE_ID,
      name: "[E2E] 테스트 쿠폰",
      coupon_type: "DISCOUNT",
      discount_unit: "FIXED",
      discount_value: 1000,
      shipping_max_free: 0,
      min_order_amount: 5000,
      valid_to: "2025-12-31",
      total_issuable: 100,
      per_customer_limit: 1,
      stackable: 0,
      status: "ISSUED",
    },
    { onConflict: "coupon_id" }
  );
}

/**
 * 테스트용 CS 티켓 데이터 생성
 */
export async function seedCsTicket(client: SupabaseClient<Database>): Promise<void> {
  await client.from("cs_ticket").upsert(
    {
      ticket_id: SEED_IDS.CS_TICKET_ID,
      order_id: SEED_IDS.ORDER_ID,
      customer_id: "00000000-0000-4000-a000-000000000099",
      type: "INQUIRY",
      status: "OPEN",
      cs_contents: "E2E 테스트용 CS 티켓입니다.",
    },
    { onConflict: "ticket_id" }
  );
}

// ─── 전체 시드 데이터 생성 ────────────────────────────────────────────────────

/**
 * 모든 E2E 테스트 데이터를 생성합니다.
 */
export async function seedAll(): Promise<void> {
  const client = createServiceClient();

  await seedStore(client);
  await seedItem(client);
  await seedOrder(client);
  await seedPickingTask(client);
  await seedPromotion(client);
  await seedCoupon(client);
  await seedCsTicket(client);
}

// ─── 테스트 데이터 정리 함수 ──────────────────────────────────────────────────

/**
 * 모든 E2E 테스트 데이터를 정리합니다.
 * 테스트 완료 후 반드시 호출해야 합니다.
 */
export async function cleanupAll(): Promise<void> {
  const client = createServiceClient();

  // 의존성 역순으로 삭제
  await client.from("cs_ticket").delete().eq("ticket_id", SEED_IDS.CS_TICKET_ID);
  await client.from("coupon").delete().eq("coupon_id", SEED_IDS.COUPON_ID);
  await client.from("promotion").delete().eq("promo_id", SEED_IDS.PROMOTION_ID);
  await client.from("picking_task").delete().eq("task_id", SEED_IDS.PICKING_TASK_ID);
  await client.from("order").delete().eq("order_id", SEED_IDS.ORDER_ID);
  await client.from("inventory").delete().eq("inventory_id", SEED_IDS.INVENTORY_ID);
  await client.from("item").delete().eq("item_id", SEED_IDS.ITEM_ID);
  await client.from("store").delete().eq("store_id", SEED_IDS.STORE_ID);
}

/**
 * 특정 이름 패턴으로 생성된 E2E 데이터 정리 (보조 함수)
 */
export async function cleanupByPattern(): Promise<void> {
  const client = createServiceClient();

  // "[E2E]" 접두어를 가진 가게 데이터 삭제
  await client.from("store").delete().like("name", "[E2E]%");
}
