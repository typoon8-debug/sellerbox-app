"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { InventoryRepository } from "@/lib/repositories/inventory.repository";
import { InventoryTxnRepository } from "@/lib/repositories/inventory-txn.repository";
import { ItemRepository } from "@/lib/repositories/item.repository";
import {
  adjustInventorySchema,
  getInventoryTxnListSchema,
  fetchItemsForInventorySchema,
  fetchInventoryByStoreSchema,
  createInventoryBatchSchema,
  updateInventoryBatchSchema,
  deactivateInventoryBatchSchema,
} from "@/lib/schemas/domain/inventory.schema";

/** 재고 조정 (INBOUND / ADJUST) */
export const adjustInventory = withAction(
  adjustInventorySchema,
  async ({ inventory_id, type, quantity, reason }) => {
    const supabase = createAdminClient();
    const inventoryRepo = new InventoryRepository(supabase);
    const txnRepo = new InventoryTxnRepository(supabase);

    // 현재 재고 조회
    const current = await inventoryRepo.findById(inventory_id);
    if (!current) throw new Error("재고 정보를 찾을 수 없습니다.");

    const beforeQty = current.on_hand;
    const afterQty = type === "INBOUND" ? beforeQty + quantity : Math.max(0, beforeQty - quantity);

    // 재고 업데이트
    await inventoryRepo.update(inventory_id, { on_hand: afterQty });

    // 트랜잭션 기록
    await txnRepo.create({
      inventory_id,
      item_id: current.item_id,
      store_id: current.store_id,
      type,
      ref_type: "MANUAL",
      ref_id: inventory_id,
      quantity,
      before_quantity: beforeQty,
      after_quantity: afterQty,
      reason: reason ?? null,
      status: "COMPLETED",
    });

    return { inventory_id, before_quantity: beforeQty, after_quantity: afterQty };
  },
  { action: "UPDATE", resource: "INVENTORY" }
);

/** 재고 트랜잭션 이력 조회 */
export const getInventoryTxnList = withAction(
  getInventoryTxnListSchema,
  async ({ inventory_id }) => {
    const supabase = createAdminClient();
    const txnRepo = new InventoryTxnRepository(supabase);
    return txnRepo.findByInventoryId(inventory_id);
  }
);

// ─── 재고관리 화면 전용 액션 ────────────────────────────────────────────────

/** 재고관리 화면 - 상품 목록 검색 (카테고리 + 상품명/SKU) */
export const fetchItemsForInventory = withAction(
  fetchItemsForInventorySchema,
  async ({ store_id, category, search, page, pageSize }) => {
    const supabase = createAdminClient();
    const itemRepo = new ItemRepository(supabase);

    const filters: Record<string, string> = { store_id };
    if (category && category !== "ALL") {
      filters.category_code_value = category;
    }

    return itemRepo.paginate({ page, pageSize, search, filters });
  }
);

/** 재고관리 화면 - 가게별 재고 목록 조회 (item JOIN + 검색 조건 동시 적용) */
export const fetchInventoryByStore = withAction(
  fetchInventoryByStoreSchema,
  async ({ store_id, category, search }) => {
    const supabase = createAdminClient();
    const inventoryRepo = new InventoryRepository(supabase);
    return inventoryRepo.findByStoreWithItemJoin(store_id, { category, search });
  }
);

/** 재고 일괄 생성 - 선택 상품으로 재고 레코드 생성
 * - 없으면: 신규 생성 (AVAILABLE)
 * - 있고 STOP이면: AVAILABLE로 재활성화
 * - 있고 AVAILABLE이면: 이미 존재 메시지 (스킵)
 */
export const createInventoryBatch = withAction(
  createInventoryBatchSchema,
  async ({ store_id, items }) => {
    const supabase = createAdminClient();
    const inventoryRepo = new InventoryRepository(supabase);
    const txnRepo = new InventoryTxnRepository(supabase);

    const itemIds = items.map((i) => i.item_id);

    // 기존 재고 목록 조회 (item_id + inventory_id + status)
    const existingItems = await inventoryRepo.findExistingItems(store_id, itemIds);
    const existingMap = new Map(existingItems.map((e) => [e.item_id, e]));

    // 분류: 신규 생성 / STOP 재활성화 / 이미 AVAILABLE (스킵)
    const toCreate = items.filter((i) => !existingMap.has(i.item_id));
    const toReactivate = existingItems.filter((e) => e.status === "STOP");
    const skippedCount = existingItems.filter((e) => e.status !== "STOP").length;

    // 신규 재고 생성
    let created: Awaited<ReturnType<typeof inventoryRepo.createBatch>> = [];
    if (toCreate.length > 0) {
      created = await inventoryRepo.createBatch(
        toCreate.map((i) => ({
          store_id,
          item_id: i.item_id,
          on_hand: i.on_hand,
          reserved: 0,
          safety_stock: i.safety_stock,
          status: "AVAILABLE" as const,
        }))
      );
    }

    // STOP → AVAILABLE 재활성화
    if (toReactivate.length > 0) {
      await Promise.all(
        toReactivate.map((e) => inventoryRepo.update(e.inventory_id, { status: "AVAILABLE" }))
      );
    }

    // 초기 입고 트랜잭션 기록 (on_hand > 0인 신규 생성 항목만)
    const txnDtos = created
      .filter((inv) => inv.on_hand > 0)
      .map((inv) => ({
        inventory_id: inv.inventory_id,
        item_id: inv.item_id,
        store_id: inv.store_id,
        type: "INBOUND" as const,
        ref_type: "MANUAL",
        ref_id: inv.inventory_id,
        quantity: inv.on_hand,
        before_quantity: 0,
        after_quantity: inv.on_hand,
        reason: "재고 초기 생성",
        status: "COMPLETED" as const,
      }));

    if (txnDtos.length > 0) {
      await txnRepo.createBatch(txnDtos);
    }

    return {
      created,
      createdCount: created.length,
      reactivatedCount: toReactivate.length,
      skippedCount,
    };
  },
  { action: "CREATE", resource: "INVENTORY" }
);

/** 재고 수량 일괄 저장 - on_hand / safety_stock 변경분 반영 + ADJUST 트랜잭션 기록 */
export const updateInventoryBatch = withAction(
  updateInventoryBatchSchema,
  async ({ updates }) => {
    const supabase = createAdminClient();
    const inventoryRepo = new InventoryRepository(supabase);
    const txnRepo = new InventoryTxnRepository(supabase);

    // 변경 전 현재 재고 값 조회
    const currentRows = await Promise.all(
      updates.map(({ inventory_id }) => inventoryRepo.findById(inventory_id))
    );

    // 재고 업데이트
    const updated = await inventoryRepo.updateBatch(
      updates.map(({ inventory_id, on_hand, safety_stock }) => ({
        id: inventory_id,
        dto: { on_hand, safety_stock },
      }))
    );

    // on_hand가 변경된 항목에 대해 ADJUST 트랜잭션 기록
    const txnDtos = updates
      .map((u, idx) => {
        const current = currentRows[idx];
        if (!current || current.on_hand === u.on_hand) return null;
        const diff = u.on_hand - current.on_hand;
        return {
          inventory_id: u.inventory_id,
          item_id: current.item_id,
          store_id: current.store_id,
          type: (diff > 0 ? "INBOUND" : "ADJUST") as "INBOUND" | "ADJUST",
          ref_type: "MANUAL",
          ref_id: u.inventory_id,
          quantity: Math.abs(diff),
          before_quantity: current.on_hand,
          after_quantity: u.on_hand,
          reason: "재고 수동 조정",
          status: "COMPLETED" as const,
        };
      })
      .filter((dto): dto is NonNullable<typeof dto> => dto !== null);

    if (txnDtos.length > 0) {
      await txnRepo.createBatch(txnDtos);
    }

    return { updated, updatedCount: updated.length };
  },
  { action: "UPDATE", resource: "INVENTORY" }
);

/** 재고 중지 - 선택 재고 STOP 처리 (판매 중단) */
export const deactivateInventoryBatch = withAction(
  deactivateInventoryBatchSchema,
  async ({ inventory_ids }) => {
    const supabase = createAdminClient();
    const inventoryRepo = new InventoryRepository(supabase);

    await Promise.all(inventory_ids.map((id) => inventoryRepo.update(id, { status: "STOP" })));

    return { deactivatedCount: inventory_ids.length };
  },
  { action: "UPDATE", resource: "INVENTORY" }
);
