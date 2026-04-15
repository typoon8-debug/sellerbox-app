import { describe, it, expect, vi } from "vitest";
import { StoreRepository } from "@/lib/repositories/store.repository";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

// ─── Supabase 클라이언트 모킹 헬퍼 ──────────────────────────────────────────

/**
 * Supabase 체이닝 메서드를 모킹하는 빌더 팩토리
 * select → eq → maybeSingle 등 체인을 흉내냅니다.
 */
function createQueryBuilder(result: {
  data?: unknown;
  error?: { message: string };
  count?: number;
}) {
  const builder: Record<string, unknown> = {};
  const methods = [
    "select",
    "insert",
    "update",
    "delete",
    "upsert",
    "eq",
    "neq",
    "or",
    "ilike",
    "order",
    "range",
    "single",
    "maybeSingle",
    "limit",
  ];
  methods.forEach((method) => {
    builder[method] = vi.fn().mockReturnValue(builder);
  });

  // 최종 await 가능하도록 then 추가 (Promise-like)
  const finalResult = {
    data: result.data ?? null,
    error: result.error ?? null,
    count: result.count ?? null,
  };
  (builder as Record<string, unknown>).then = (resolve: (v: typeof finalResult) => void) =>
    resolve(finalResult);

  return builder;
}

function createMockSupabaseClient(result: {
  data?: unknown;
  error?: { message: string };
  count?: number;
}): SupabaseClient<Database> {
  const qb = createQueryBuilder(result);
  return {
    from: vi.fn().mockReturnValue(qb),
  } as unknown as SupabaseClient<Database>;
}

// ─── StoreRepository 단위 테스트 ─────────────────────────────────────────────

describe("StoreRepository", () => {
  const storeRow = {
    store_id: "store-001",
    tenant_id: "tenant-001",
    name: "테스트 가게",
    store_category: "GENERAL",
    address: "서울시 강남구",
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
    created_at: "2024-01-01T00:00:00Z",
    updated_at: null,
  };

  describe("findAll()", () => {
    it("가게 목록을 배열로 반환한다", async () => {
      const client = createMockSupabaseClient({ data: [storeRow] });
      const repo = new StoreRepository(client);

      const result = await repo.findAll();

      expect(client.from).toHaveBeenCalledWith("store");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ store_id: "store-001", name: "테스트 가게" });
    });

    it("에러 발생 시 Error를 throw한다", async () => {
      const client = createMockSupabaseClient({ error: { message: "DB error" } });
      const repo = new StoreRepository(client);

      await expect(repo.findAll()).rejects.toThrow("DB error");
    });
  });

  describe("findById()", () => {
    it("ID로 가게를 조회하면 Row를 반환한다", async () => {
      const client = createMockSupabaseClient({ data: storeRow });
      const repo = new StoreRepository(client);

      const result = await repo.findById("store-001");

      expect(result).toMatchObject({ store_id: "store-001" });
    });

    it("존재하지 않는 ID 조회 시 null을 반환한다", async () => {
      const client = createMockSupabaseClient({ data: null });
      const repo = new StoreRepository(client);

      const result = await repo.findById("not-exist");

      expect(result).toBeNull();
    });
  });

  describe("paginate()", () => {
    it("페이지네이션 결과를 PaginatedResult 형태로 반환한다", async () => {
      const client = createMockSupabaseClient({ data: [storeRow], count: 1 });
      const repo = new StoreRepository(client);

      const result = await repo.paginate({ page: 1, pageSize: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.hasNextPage).toBe(false);
    });

    it("검색어가 있을 때 applySearch가 호출된다", async () => {
      const client = createMockSupabaseClient({ data: [], count: 0 });
      const repo = new StoreRepository(client);

      const result = await repo.paginate({ page: 1, pageSize: 10, search: "테스트" });

      expect(result.data).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it("hasNextPage는 다음 페이지가 있을 때 true를 반환한다", async () => {
      const client = createMockSupabaseClient({ data: [storeRow], count: 25 });
      const repo = new StoreRepository(client);

      const result = await repo.paginate({ page: 1, pageSize: 10 });

      expect(result.hasNextPage).toBe(true);
    });
  });

  describe("create()", () => {
    it("새 가게를 생성하면 생성된 Row를 반환한다", async () => {
      const client = createMockSupabaseClient({ data: storeRow });
      const repo = new StoreRepository(client);

      const result = await repo.create({
        tenant_id: "tenant-001",
        name: "테스트 가게",
        store_category: "GENERAL",
        address: "서울시 강남구",
        phone: "02-0000-0001",
        min_delivery_price: 15000,
        delivery_tip: 3000,
        reg_number: "123-45-67890",
        jumin_number: "900101-1000000",
        ceo_name: "홍길동",
        fee: 3.5,
        contract_start_at: "2024-01-01",
        contract_end_at: "2025-12-31",
      });

      expect(result).toMatchObject({ store_id: "store-001" });
    });
  });

  describe("update()", () => {
    it("가게 정보를 수정하면 수정된 Row를 반환한다", async () => {
      const updatedRow = { ...storeRow, name: "수정된 가게" };
      const client = createMockSupabaseClient({ data: updatedRow });
      const repo = new StoreRepository(client);

      const result = await repo.update("store-001", { name: "수정된 가게" });

      expect(result).toMatchObject({ name: "수정된 가게" });
    });
  });

  describe("delete()", () => {
    it("가게를 삭제하면 에러 없이 완료된다", async () => {
      const client = createMockSupabaseClient({ data: null });
      const repo = new StoreRepository(client);

      await expect(repo.delete("store-001")).resolves.toBeUndefined();
    });
  });
});
