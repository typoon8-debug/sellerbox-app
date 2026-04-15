import { describe, it, expect, vi } from "vitest";
import { ItemRepository } from "@/lib/repositories/item.repository";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

// ─── 공통 모킹 헬퍼 ──────────────────────────────────────────────────────────

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

// ─── ItemRepository 단위 테스트 ──────────────────────────────────────────────

describe("ItemRepository", () => {
  const itemRow = {
    item_id: "item-001",
    store_id: "store-001",
    sku: "SKU-001",
    category_code_value: "FRESH",
    category_name: "신선식품",
    name: "테스트 상품",
    list_price: 10000,
    sale_price: 8000,
    ranking_yn: "N",
    ranking: 0,
    status: "ACTIVE",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: null,
  };

  describe("findAll()", () => {
    it("상품 목록을 반환한다", async () => {
      const client = createMockSupabaseClient({ data: [itemRow] });
      const repo = new ItemRepository(client);

      const result = await repo.findAll();

      expect(client.from).toHaveBeenCalledWith("item");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ item_id: "item-001", name: "테스트 상품" });
    });

    it("DB 에러 발생 시 Error를 throw한다", async () => {
      const client = createMockSupabaseClient({ error: { message: "connection error" } });
      const repo = new ItemRepository(client);

      await expect(repo.findAll()).rejects.toThrow("connection error");
    });
  });

  describe("findById()", () => {
    it("ID로 상품을 조회한다", async () => {
      const client = createMockSupabaseClient({ data: itemRow });
      const repo = new ItemRepository(client);

      const result = await repo.findById("item-001");

      expect(result).toMatchObject({ item_id: "item-001", sku: "SKU-001" });
    });

    it("존재하지 않는 상품 조회 시 null을 반환한다", async () => {
      const client = createMockSupabaseClient({ data: null });
      const repo = new ItemRepository(client);

      const result = await repo.findById("not-exist");

      expect(result).toBeNull();
    });
  });

  describe("paginate()", () => {
    it("상품 목록을 페이지네이션으로 반환한다", async () => {
      const client = createMockSupabaseClient({ data: [itemRow, itemRow], count: 2 });
      const repo = new ItemRepository(client);

      const result = await repo.paginate({ page: 1, pageSize: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.hasNextPage).toBe(false);
    });

    it("필터 조건이 있을 때 정상 동작한다", async () => {
      const client = createMockSupabaseClient({ data: [itemRow], count: 1 });
      const repo = new ItemRepository(client);

      const result = await repo.paginate({
        page: 1,
        pageSize: 10,
        filters: { status: "ACTIVE" },
      });

      expect(result.data).toHaveLength(1);
    });

    it("검색어 포함 시 paginate가 정상 동작한다", async () => {
      const client = createMockSupabaseClient({ data: [], count: 0 });
      const repo = new ItemRepository(client);

      const result = await repo.paginate({ page: 1, pageSize: 10, search: "신선" });

      expect(result.data).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe("create()", () => {
    it("상품을 생성하면 생성된 Row를 반환한다", async () => {
      const client = createMockSupabaseClient({ data: itemRow });
      const repo = new ItemRepository(client);

      const result = await repo.create({
        store_id: "store-001",
        sku: "SKU-001",
        category_code_value: "FRESH",
        category_name: "신선식품",
        name: "테스트 상품",
        list_price: 10000,
        sale_price: 8000,
        ranking_yn: "N",
        ranking: 0,
        status: "ACTIVE",
      });

      expect(result).toMatchObject({ item_id: "item-001" });
    });
  });

  describe("update()", () => {
    it("상품 정보 수정 시 수정된 Row를 반환한다", async () => {
      const updatedRow = { ...itemRow, sale_price: 7000 };
      const client = createMockSupabaseClient({ data: updatedRow });
      const repo = new ItemRepository(client);

      const result = await repo.update("item-001", { sale_price: 7000 });

      expect(result).toMatchObject({ sale_price: 7000 });
    });
  });

  describe("delete()", () => {
    it("상품 삭제가 에러 없이 완료된다", async () => {
      const client = createMockSupabaseClient({ data: null });
      const repo = new ItemRepository(client);

      await expect(repo.delete("item-001")).resolves.toBeUndefined();
    });
  });
});
