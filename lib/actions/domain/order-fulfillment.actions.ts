"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { OrderItemRepository } from "@/lib/repositories/order-item.repository";
import { PickingTaskRepository } from "@/lib/repositories/picking-task.repository";
import { PackingTaskRepository } from "@/lib/repositories/packing-task.repository";
import { LabelRepository } from "@/lib/repositories/label.repository";
import { generateZpl } from "@/lib/utils/zpl-generator";
import {
  fetchOrdersForFulfillmentSchema,
  fetchOrderItemsWithInventorySchema,
  fetchDashboardStatsSchema,
  batchStartPickingSchema,
  batchCompletePackingSchema,
  batchGenerateLabelsSchema,
  batchCreateDispatchRequestsSchema,
  updateOrderStatusSchema,
  fetchDispatchRequestsByStoreSchema,
  fetchPrintDataSchema,
} from "@/lib/schemas/domain/order-fulfillment.schema";
import type { Database } from "@/lib/supabase/database.types";

type OrderRow = Database["public"]["Tables"]["order"]["Row"];

/** 회원명 포함 주문 타입 */
export type OrderWithCustomer = OrderRow & {
  customer_name: string;
};

/** 상품명 + 재고수량 포함 주문 아이템 타입 */
export type OrderItemWithInventory = Database["public"]["Tables"]["order_item"]["Row"] & {
  item_name: string;
  on_hand: number;
};

/** 회원명 포함 배송요청 타입 */
export type DispatchRequestWithOrder = Database["public"]["Tables"]["dispatch_request"]["Row"] & {
  order_no: string;
  customer_name: string;
  delivery_method: string | null;
};

/** 카테고리별 집계 아이템 타입 (출력용) */
export type CategorySummaryItem = {
  category: string;
  item_name: string;
  item_id: string;
  total_qty: number;
};

/** 주문별 상품 목록 타입 (출력용) */
export type OrderPrintItem = {
  order_id: string;
  order_no: string;
  customer_name: string;
  items: { item_name: string; qty: number }[];
};

// ---------------------------------------------------------------------------
// 1. 주문 목록 조회 (가게 + 날짜범위)
// ---------------------------------------------------------------------------

export const fetchOrdersForFulfillment = withAction(
  fetchOrdersForFulfillmentSchema,
  async ({ store_id, from_date, to_date, delivery_filter }) => {
    const supabase = createAdminClient();
    const orderRepo = new OrderRepository(supabase);

    const orders = await orderRepo.findByStoreAndDateRange(
      store_id,
      from_date,
      to_date,
      delivery_filter
    );

    if (orders.length === 0) return [] as OrderWithCustomer[];

    // customer_id로 users 테이블에서 이름 조회
    const customerIds = [...new Set(orders.map((o) => o.customer_id).filter(Boolean))] as string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: usersData } = await (supabase as any)
      .from("users")
      .select("user_id, name")
      .in("user_id", customerIds);

    const userMap = new Map<string, string>(
      ((usersData ?? []) as { user_id: string; name: string }[]).map((u) => [u.user_id, u.name])
    );

    return orders.map((o) => ({
      ...o,
      customer_name: o.customer_id ? (userMap.get(o.customer_id) ?? "-") : "-",
    })) as OrderWithCustomer[];
  }
);

// ---------------------------------------------------------------------------
// 2. 주문 상세 아이템 조회 (item + inventory JOIN)
// ---------------------------------------------------------------------------

export const fetchOrderItemsWithInventory = withAction(
  fetchOrderItemsWithInventorySchema,
  async ({ order_id }) => {
    const supabase = createAdminClient();
    const orderItemRepo = new OrderItemRepository(supabase);

    const items = await orderItemRepo.findByOrderId(order_id);
    if (items.length === 0) return [] as OrderItemWithInventory[];

    const itemIds = [...new Set(items.map((i) => i.item_id).filter(Boolean))] as string[];

    // item 테이블에서 이름 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: itemsData } = await (supabase as any)
      .from("item")
      .select("item_id, name")
      .in("item_id", itemIds);

    const itemMap = new Map<string, string>(
      ((itemsData ?? []) as { item_id: string; name: string }[]).map((i) => [i.item_id, i.name])
    );

    // inventory 테이블에서 재고수량 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inventoryData } = await (supabase as any)
      .from("inventory")
      .select("item_id, on_hand")
      .in("item_id", itemIds)
      .eq("status", "AVAILABLE");

    const inventoryMap = new Map<string, number>(
      ((inventoryData ?? []) as { item_id: string; on_hand: number }[]).map((inv) => [
        inv.item_id,
        inv.on_hand,
      ])
    );

    return items.map((item) => ({
      ...item,
      item_name: item.item_id ? (itemMap.get(item.item_id) ?? "-") : "-",
      on_hand: item.item_id ? (inventoryMap.get(item.item_id) ?? 0) : 0,
    })) as OrderItemWithInventory[];
  }
);

// ---------------------------------------------------------------------------
// 3. 대시보드 통계 조회
// ---------------------------------------------------------------------------

export const fetchDashboardStats = withAction(
  fetchDashboardStatsSchema,
  async ({ store_id, date }) => {
    const supabase = createAdminClient();
    const orderRepo = new OrderRepository(supabase);
    return await orderRepo.getStats(store_id, date);
  }
);

// ---------------------------------------------------------------------------
// 4. 일괄 피킹 처리 (PAID → PACKING + picking_task PICKED)
// ---------------------------------------------------------------------------

export const batchStartPicking = withAction(
  batchStartPickingSchema,
  async ({ order_ids, store_id }) => {
    const supabase = createAdminClient();
    const orderRepo = new OrderRepository(supabase);
    const orderItemRepo = new OrderItemRepository(supabase);
    const pickingTaskRepo = new PickingTaskRepository(supabase);

    const successIds: string[] = [];
    const failedIds: string[] = [];

    for (const orderId of order_ids) {
      try {
        const order = await orderRepo.findById(orderId);
        if (!order || order.status !== "PAID") {
          failedIds.push(orderId);
          continue;
        }

        // picking_task 생성 (즉시 PICKED 처리)
        const now = new Date().toISOString();
        const task = await pickingTaskRepo.create({
          order_id: orderId,
          store_id,
          status: "PICKED",
          completed_at: now,
        });

        // order_item 기반 picking_item 일괄 생성
        const orderItems = await orderItemRepo.findByOrderId(orderId);
        if (orderItems.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from("picking_item").insert(
            orderItems.map((oi) => ({
              task_id: task.task_id,
              order_item_id: oi.order_detail_id,
              requested_qty: oi.qty,
              picked_qty: oi.qty,
              result: "OK",
            }))
          );
        }

        // 주문 상태 PACKING으로 변경
        await orderRepo.update(orderId, { status: "PACKING" });
        successIds.push(orderId);
      } catch {
        failedIds.push(orderId);
      }
    }

    return { successCount: successIds.length, failedIds };
  },
  { action: "UPDATE", resource: "PICKING_TASK" }
);

// ---------------------------------------------------------------------------
// 5. 일괄 패킹 처리
// ---------------------------------------------------------------------------

export const batchCompletePacking = withAction(
  batchCompletePackingSchema,
  async ({ order_ids }) => {
    const supabase = createAdminClient();
    const orderRepo = new OrderRepository(supabase);
    const packingTaskRepo = new PackingTaskRepository(supabase);

    const successIds: string[] = [];
    const failedIds: string[] = [];

    for (const orderId of order_ids) {
      try {
        const order = await orderRepo.findById(orderId);
        if (!order || order.status !== "PACKING") {
          failedIds.push(orderId);
          continue;
        }

        const now = new Date().toISOString();
        await packingTaskRepo.create({
          order_id: orderId,
          status: "PACKED",
          completed_at: now,
        });

        successIds.push(orderId);
      } catch {
        failedIds.push(orderId);
      }
    }

    return { successCount: successIds.length, failedIds };
  },
  { action: "UPDATE", resource: "PACKING_TASK" }
);

// ---------------------------------------------------------------------------
// 6. 일괄 라벨 생성 (INVOICE)
// ---------------------------------------------------------------------------

export const batchGenerateLabels = withAction(
  batchGenerateLabelsSchema,
  async ({ order_ids }) => {
    const supabase = createAdminClient();
    const orderRepo = new OrderRepository(supabase);
    const orderItemRepo = new OrderItemRepository(supabase);
    const labelRepo = new LabelRepository(supabase);

    const labels: { order_id: string; label_id: string; zpl_text: string }[] = [];
    const failedIds: string[] = [];

    // 주문 정보 + 고객 정보 조회
    const orders = await Promise.all(order_ids.map((id) => orderRepo.findById(id)));
    const validOrders = orders.filter(Boolean) as OrderRow[];

    if (validOrders.length === 0) return { labels, failedIds: order_ids };

    const customerIds = [
      ...new Set(validOrders.map((o) => o.customer_id).filter(Boolean)),
    ] as string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: usersData } = await (supabase as any)
      .from("users")
      .select("user_id, name")
      .in("user_id", customerIds);

    const userMap = new Map<string, string>(
      ((usersData ?? []) as { user_id: string; name: string }[]).map((u) => [u.user_id, u.name])
    );

    for (const order of validOrders) {
      try {
        const orderItems = await orderItemRepo.findByOrderId(order.order_id);
        const customerName = order.customer_id ? (userMap.get(order.customer_id) ?? "") : "";
        const now = new Date().toISOString();

        const zplText = generateZpl("INVOICE", {
          orderNo: order.order_no ?? order.order_id,
          recipientName: customerName,
          itemCount: orderItems.length,
          printedAt: new Date().toLocaleString("ko-KR"),
        });

        const label = await labelRepo.create({
          order_id: order.order_id,
          label_type: "INVOICE",
          zpl_text: zplText,
          printed_at: now,
        });

        labels.push({
          order_id: order.order_id,
          label_id: label.label_id,
          zpl_text: zplText,
        });
      } catch {
        failedIds.push(order.order_id);
      }
    }

    return { labels, successCount: labels.length, failedIds };
  },
  { action: "CREATE", resource: "LABEL" }
);

// ---------------------------------------------------------------------------
// 7. 일괄 배송요청 생성
// ---------------------------------------------------------------------------

export const batchCreateDispatchRequests = withAction(
  batchCreateDispatchRequestsSchema,
  async ({ order_ids, store_id }) => {
    const supabase = createAdminClient();
    const orderRepo = new OrderRepository(supabase);

    const successIds: string[] = [];
    const failedIds: string[] = [];

    for (const orderId of order_ids) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("dispatch_request").insert({
          order_id: orderId,
          store_id,
          status: "REQUESTED",
          requested_at: new Date().toISOString(),
        });

        // 주문 상태 DISPATCHED로 변경
        await orderRepo.update(orderId, { status: "DISPATCHED" });
        successIds.push(orderId);
      } catch {
        failedIds.push(orderId);
      }
    }

    return { successCount: successIds.length, failedIds };
  },
  { action: "CREATE", resource: "DISPATCH_REQUEST" }
);

// ---------------------------------------------------------------------------
// 8. 주문 상태 수정 (역전이 포함)
// ---------------------------------------------------------------------------

export const updateOrderStatusAction = withAction(
  updateOrderStatusSchema,
  async ({ order_id, status }) => {
    const supabase = createAdminClient();
    const orderRepo = new OrderRepository(supabase);
    return await orderRepo.update(order_id, { status });
  },
  { action: "UPDATE", resource: "ORDER" }
);

// ---------------------------------------------------------------------------
// 9. 배송요청 목록 조회
// ---------------------------------------------------------------------------

export const fetchDispatchRequestsByStore = withAction(
  fetchDispatchRequestsByStoreSchema,
  async ({ store_id, from_date, to_date }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    const { data, error } = await supabase
      .from("dispatch_request")
      .select("*")
      .eq("store_id", store_id)
      .gte("requested_at", `${from_date}T00:00:00`)
      .lte("requested_at", `${to_date}T23:59:59`)
      .order("requested_at", { ascending: false });

    if (error) throw new Error(error.message);

    const requests = (data ?? []) as Database["public"]["Tables"]["dispatch_request"]["Row"][];
    if (requests.length === 0) return [] as DispatchRequestWithOrder[];

    // 주문 정보 (order_no, delivery_method) + 고객명 조회
    const orderIds = [...new Set(requests.map((r) => r.order_id))];
    const { data: ordersData } = await supabase
      .from("order")
      .select("order_id, order_no, delivery_method, customer_id")
      .in("order_id", orderIds);

    const orderMap = new Map<
      string,
      { order_no: string | null; delivery_method: string | null; customer_id: string | null }
    >(
      (
        (ordersData ?? []) as {
          order_id: string;
          order_no: string | null;
          delivery_method: string | null;
          customer_id: string | null;
        }[]
      ).map((o) => [
        o.order_id,
        { order_no: o.order_no, delivery_method: o.delivery_method, customer_id: o.customer_id },
      ])
    );

    const customerIds = [
      ...new Set([...orderMap.values()].map((o) => o.customer_id).filter(Boolean)),
    ] as string[];

    let userMap = new Map<string, string>();
    if (customerIds.length > 0) {
      const { data: usersData } = await supabase
        .from("users")
        .select("user_id, name")
        .in("user_id", customerIds);

      userMap = new Map<string, string>(
        ((usersData ?? []) as { user_id: string; name: string }[]).map((u) => [u.user_id, u.name])
      );
    }

    return requests.map((r) => {
      const orderInfo = orderMap.get(r.order_id);
      const customerId = orderInfo?.customer_id;
      return {
        ...r,
        order_no: orderInfo?.order_no ?? r.order_id,
        customer_name: customerId ? (userMap.get(customerId) ?? "-") : "-",
        delivery_method: orderInfo?.delivery_method ?? null,
      };
    }) as DispatchRequestWithOrder[];
  }
);

// ---------------------------------------------------------------------------
// 10. 주문처리 리스트 출력 데이터 조회
// ---------------------------------------------------------------------------

export const fetchPrintData = withAction(fetchPrintDataSchema, async ({ order_ids }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const orderRepo = new OrderRepository(supabase);
  const orderItemRepo = new OrderItemRepository(supabase);

  const orders = await Promise.all(order_ids.map((id) => orderRepo.findById(id)));
  const validOrders = orders.filter(Boolean) as OrderRow[];

  if (validOrders.length === 0) {
    return { categorySummary: [] as CategorySummaryItem[], orderItems: [] as OrderPrintItem[] };
  }

  const customerIds = [
    ...new Set(validOrders.map((o) => o.customer_id).filter(Boolean)),
  ] as string[];
  const { data: usersData } = await supabase
    .from("users")
    .select("user_id, name")
    .in("user_id", customerIds);

  const userMap = new Map<string, string>(
    ((usersData ?? []) as { user_id: string; name: string }[]).map((u) => [u.user_id, u.name])
  );

  // 각 주문의 아이템 목록 조회
  const allOrderItems = await Promise.all(
    validOrders.map(async (order) => ({
      order,
      items: await orderItemRepo.findByOrderId(order.order_id),
    }))
  );

  // 전체 item_id 목록으로 상품 정보 조회
  const allItemIds = [
    ...new Set(allOrderItems.flatMap(({ items }) => items.map((i) => i.item_id).filter(Boolean))),
  ] as string[];

  const { data: itemsData } = await supabase
    .from("item")
    .select("item_id, name, category_code_value")
    .in("item_id", allItemIds);

  const itemInfoMap = new Map<string, { name: string; category: string }>(
    (
      (itemsData ?? []) as { item_id: string; name: string; category_code_value: string | null }[]
    ).map((i) => [i.item_id, { name: i.name, category: i.category_code_value ?? "기타" }])
  );

  // Panel 1: 카테고리별 집계
  const categoryQtyMap = new Map<string, Map<string, { item_name: string; qty: number }>>();
  for (const { items } of allOrderItems) {
    for (const item of items) {
      if (!item.item_id) continue;
      const info = itemInfoMap.get(item.item_id);
      if (!info) continue;
      const cat = info.category;
      if (!categoryQtyMap.has(cat)) categoryQtyMap.set(cat, new Map());
      const catMap = categoryQtyMap.get(cat)!;
      const existing = catMap.get(item.item_id);
      if (existing) {
        existing.qty += item.qty;
      } else {
        catMap.set(item.item_id, { item_name: info.name, qty: item.qty });
      }
    }
  }

  const categorySummary: CategorySummaryItem[] = [];
  for (const [category, itemMap] of categoryQtyMap) {
    for (const [item_id, { item_name, qty }] of itemMap) {
      categorySummary.push({ category, item_name, item_id, total_qty: qty });
    }
  }
  categorySummary.sort(
    (a, b) => a.category.localeCompare(b.category) || a.item_name.localeCompare(b.item_name)
  );

  // Panel 2: 주문별 상품 목록
  const orderItems: OrderPrintItem[] = allOrderItems.map(({ order, items }) => {
    const customerName = order.customer_id ? (userMap.get(order.customer_id) ?? "-") : "-";
    return {
      order_id: order.order_id,
      order_no: order.order_no ?? order.order_id,
      customer_name: customerName,
      items: items.map((i) => ({
        item_name: i.item_id ? (itemInfoMap.get(i.item_id)?.name ?? "-") : "-",
        qty: i.qty,
      })),
    };
  });

  return { categorySummary, orderItems };
});
