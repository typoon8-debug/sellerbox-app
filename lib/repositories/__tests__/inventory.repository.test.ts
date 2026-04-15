import { describe, it, expect, vi } from "vitest";
import { InventoryRepository } from "@/lib/repositories/inventory.repository";
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

// ─── InventoryRepository 단위 테스트 ─────────────────────────────────────────

describe("InventoryRepository", () => {
  const inventoryRow = {
    inventory_id: "inv-001",
    item_id: "item-001",
    store_id: "store-001",
    on_hand: 100,
    reserved: 5,
    status: "AVAILABLE",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: null,
  };

  const inventoryWithItem = {
    ...inventoryRow,
    item: {
      item_id: "item-001",
      name: "테스트 상품",
      sku: "SKU-001",
      status: "ACTIVE",
    },
  };

  describe("findAll()", () => {
    it("재고 목록을 반환한다", async () => {
      const client = createMockSupabaseClient({ data: [inventoryRow] });
      const repo = new InventoryRepository(client);

      const result = await repo.findAll();

      expect(client.from).toHaveBeenCalledWith("inventory");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ inventory_id: "inv-001", on_hand: 100 });
    });

    it("DB 에러 발생 시 Error를 throw한다", async () => {
      const client = createMockSupabaseClient({ error: { message: "inventory error" } });
      const repo = new InventoryRepository(client);

      await expect(repo.findAll()).rejects.toThrow("inventory error");
    });
  });

  describe("findById()", () => {
    it("ID로 재고를 조회한다", async () => {
      const client = createMockSupabaseClient({ data: inventoryRow });
      const repo = new InventoryRepository(client);

      const result = await repo.findById("inv-001");

      expect(result).toMatchObject({ inventory_id: "inv-001", on_hand: 100 });
    });

    it("존재하지 않는 재고 조회 시 null을 반환한다", async () => {
      const client = createMockSupabaseClient({ data: null });
      const repo = new InventoryRepository(client);

      const result = await repo.findById("not-exist");

      expect(result).toBeNull();
    });
  });

  describe("findByStoreWithItemJoin()", () => {
    it("가게 ID로 상품 정보 포함 재고 목록을 조회한다", async () => {
      const client = createMockSupabaseClient({ data: [inventoryWithItem] });
      const repo = new InventoryRepository(client);

      const result = await repo.findByStoreWithItemJoin("store-001");

      expect(client.from).toHaveBeenCalledWith("inventory");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ inventory_id: "inv-001" });
    });

    it("JOIN 쿼리 에러 발생 시 Error를 throw한다", async () => {
      const client = createMockSupabaseClient({ error: { message: "join error" } });
      const repo = new InventoryRepository(client);

      await expect(repo.findByStoreWithItemJoin("store-001")).rejects.toThrow("join error");
    });
  });

  describe("paginate()", () => {
    it("재고 목록을 페이지네이션으로 반환한다", async () => {
      const client = createMockSupabaseClient({ data: [inventoryRow], count: 1 });
      const repo = new InventoryRepository(client);

      const result = await repo.paginate({ page: 1, pageSize: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it("2페이지 이상일 때 hasNextPage가 올바르게 동작한다", async () => {
      const client = createMockSupabaseClient({ data: Array(10).fill(inventoryRow), count: 30 });
      const repo = new InventoryRepository(client);

      const result = await repo.paginate({ page: 1, pageSize: 10 });

      expect(result.hasNextPage).toBe(true);
    });
  });

  describe("create()", () => {
    it("재고를 생성하면 생성된 Row를 반환한다", async () => {
      const client = createMockSupabaseClient({ data: inventoryRow });
      const repo = new InventoryRepository(client);

      const result = await repo.create({
        item_id: "item-001",
        store_id: "store-001",
        on_hand: 100,
        reserved: 0,
        status: "AVAILABLE",
      });

      expect(result).toMatchObject({ inventory_id: "inv-001" });
    });
  });

  describe("update()", () => {
    it("재고 수량 수정 시 수정된 Row를 반환한다", async () => {
      const updatedRow = { ...inventoryRow, on_hand: 80 };
      const client = createMockSupabaseClient({ data: updatedRow });
      const repo = new InventoryRepository(client);

      const result = await repo.update("inv-001", { on_hand: 80 });

      expect(result).toMatchObject({ on_hand: 80 });
    });
  });
});
