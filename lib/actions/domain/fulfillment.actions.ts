"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { PickingTaskRepository } from "@/lib/repositories/picking-task.repository";
import { PickingItemRepository } from "@/lib/repositories/picking-item.repository";
import { PackingTaskRepository } from "@/lib/repositories/packing-task.repository";
import {
  startPickingSchema,
  completePickingSchema,
  completePackingSchema,
} from "@/lib/schemas/domain/fulfillment.schema";

/** 피킹 시작 (CREATED → PICKING) */
export const startPicking = withAction(
  startPickingSchema,
  async ({ task_id, picker_id }) => {
    const supabase = createAdminClient();
    const repo = new PickingTaskRepository(supabase);
    return repo.update(task_id, { picker_id, status: "PICKING" });
  },
  { action: "UPDATE", resource: "PICKING_TASK" }
);

/** 피킹 완료 (PICKING → PICKED / FAILED) */
export const completePicking = withAction(
  completePickingSchema,
  async ({ task_id, items }) => {
    const supabase = createAdminClient();
    const taskRepo = new PickingTaskRepository(supabase);
    const itemRepo = new PickingItemRepository(supabase);

    // 피킹 항목 결과 업데이트
    for (const item of items) {
      await itemRepo.update(item.picking_item_id, {
        picked_qty: item.picked_qty,
        result: item.result,
        substitute_product_id: item.substitute_product_id ?? null,
        memo: item.memo ?? null,
      });
    }

    // 모든 항목 SHORT이면 FAILED, 아니면 PICKED
    const allShort = items.every((i) => i.result === "SHORT");
    const status = allShort ? "FAILED" : "PICKED";

    return taskRepo.update(task_id, {
      status,
      completed_at: new Date().toISOString(),
    });
  },
  { action: "UPDATE", resource: "PICKING_TASK" }
);

/** 패킹 완료 (PACKING → PACKED) */
export const completePacking = withAction(
  completePackingSchema,
  async ({ pack_id, packing_weight }) => {
    const supabase = createAdminClient();
    const repo = new PackingTaskRepository(supabase);
    return repo.update(pack_id, {
      status: "PACKED",
      packing_weight,
      completed_at: new Date().toISOString(),
    });
  },
  { action: "UPDATE", resource: "PACKING_TASK" }
);
