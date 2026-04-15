"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { InventoryRepository } from "@/lib/repositories/inventory.repository";
import { InventoryTxnRepository } from "@/lib/repositories/inventory-txn.repository";
import { adjustInventorySchema } from "@/lib/schemas/domain/inventory.schema";

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
