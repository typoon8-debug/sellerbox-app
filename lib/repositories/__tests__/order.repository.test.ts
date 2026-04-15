import { describe, it, expect, vi } from "vitest";
import { OrderRepository } from "@/lib/repositories/order.repository";
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

// ─── OrderRepository 단위 테스트 ─────────────────────────────────────────────

describe("OrderRepository", () => {
  const orderRow = {
    order_id: "order-001",
    store_id: "store-001",
    customer_id: "customer-001",
    order_no: "ORD-2024-0001",
    status: "PAID",
    discounted_total_price: 8000,
    origin_total_price: 10000,
    delivery_method: "DELIVERY",
    delivery_price: 3000,
    order_price: 8000,
    final_payable: 8000,
    ordered_at: "2024-01-01T10:00:00Z",
    created_at: "2024-01-01T10:00:00Z",
    updated_at: null,
  };

  describe("findAll()", () => {
    it("주문 목록을 반환한다", async () => {
      const client = createMockSupabaseClient({ data: [orderRow] });
      const repo = new OrderRepository(client);

      const result = await repo.findAll();

      expect(client.from).toHaveBeenCalledWith("order");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ order_id: "order-001", order_no: "ORD-2024-0001" });
    });

    it("DB 에러 발생 시 Error를 throw한다", async () => {
      const client = createMockSupabaseClient({ error: { message: "order error" } });
      const repo = new OrderRepository(client);

      await expect(repo.findAll()).rejects.toThrow("order error");
    });
  });

  describe("findById()", () => {
    it("ID로 주문을 조회한다", async () => {
      const client = createMockSupabaseClient({ data: orderRow });
      const repo = new OrderRepository(client);

      const result = await repo.findById("order-001");

      expect(result).toMatchObject({ order_id: "order-001", status: "PAID" });
    });

    it("존재하지 않는 주문 조회 시 null을 반환한다", async () => {
      const client = createMockSupabaseClient({ data: null });
      const repo = new OrderRepository(client);

      const result = await repo.findById("not-exist");

      expect(result).toBeNull();
    });
  });

  describe("paginate()", () => {
    it("주문 목록을 페이지네이션으로 반환한다", async () => {
      const client = createMockSupabaseClient({ data: [orderRow], count: 1 });
      const repo = new OrderRepository(client);

      const result = await repo.paginate({ page: 1, pageSize: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.hasNextPage).toBe(false);
    });

    it("상태 필터 적용 시 paginate가 정상 동작한다", async () => {
      const client = createMockSupabaseClient({ data: [orderRow], count: 1 });
      const repo = new OrderRepository(client);

      const result = await repo.paginate({
        page: 1,
        pageSize: 10,
        filters: { status: "PAID" },
      });

      expect(result.data).toHaveLength(1);
    });

    it("주문번호 검색 시 paginate가 정상 동작한다", async () => {
      const client = createMockSupabaseClient({ data: [orderRow], count: 1 });
      const repo = new OrderRepository(client);

      const result = await repo.paginate({ page: 1, pageSize: 10, search: "ORD-2024" });

      expect(result.data).toHaveLength(1);
    });

    it("여러 페이지 데이터가 있을 때 hasNextPage가 true를 반환한다", async () => {
      const orders = Array(10).fill(orderRow);
      const client = createMockSupabaseClient({ data: orders, count: 50 });
      const repo = new OrderRepository(client);

      const result = await repo.paginate({ page: 1, pageSize: 10 });

      expect(result.hasNextPage).toBe(true);
    });
  });

  describe("create()", () => {
    it("주문을 생성하면 생성된 Row를 반환한다", async () => {
      const client = createMockSupabaseClient({ data: orderRow });
      const repo = new OrderRepository(client);

      const result = await repo.create({
        store_id: "store-001",
        customer_id: "customer-001",
        order_no: "ORD-2024-0001",
        status: "PAID",
        discounted_total_price: 8000,
        origin_total_price: 10000,
        delivery_method: "DELIVERY",
        delivery_price: 3000,
        order_price: 8000,
        final_payable: 8000,
      });

      expect(result).toMatchObject({ order_id: "order-001" });
    });
  });

  describe("update()", () => {
    it("주문 상태 변경 시 수정된 Row를 반환한다", async () => {
      const updatedRow = { ...orderRow, status: "DELIVERED" };
      const client = createMockSupabaseClient({ data: updatedRow });
      const repo = new OrderRepository(client);

      const result = await repo.update("order-001", { status: "DELIVERED" });

      expect(result).toMatchObject({ status: "DELIVERED" });
    });
  });

  describe("delete()", () => {
    it("주문 삭제가 에러 없이 완료된다", async () => {
      const client = createMockSupabaseClient({ data: null });
      const repo = new OrderRepository(client);

      await expect(repo.delete("order-001")).resolves.toBeUndefined();
    });
  });
});
