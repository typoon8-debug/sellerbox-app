"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { StoreQuickSlotUsageRepository } from "@/lib/repositories/store-quick-slot-usage.repository";
import {
  createSlotUsageSchema,
  updateSlotUsageSchema,
  deleteSlotUsageSchema,
} from "@/lib/schemas/domain/store-quick-slot-usage.schema";

/** 슬롯 사용량 생성 */
export const createSlotUsage = withAction(
  createSlotUsageSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new StoreQuickSlotUsageRepository(supabase);
    return repo.create(input);
  },
  { action: "CREATE", resource: "STORE_QUICK_SLOT_USAGE" }
);

/** 슬롯 사용량 수정 */
export const updateSlotUsage = withAction(
  updateSlotUsageSchema,
  async ({ usage_id, ...rest }) => {
    const supabase = createAdminClient();
    const repo = new StoreQuickSlotUsageRepository(supabase);
    return repo.update(usage_id, rest);
  },
  { action: "UPDATE", resource: "STORE_QUICK_SLOT_USAGE" }
);

/** 슬롯 사용량 삭제 */
export const deleteSlotUsage = withAction(
  deleteSlotUsageSchema,
  async ({ usage_id }) => {
    const supabase = createAdminClient();
    const repo = new StoreQuickSlotUsageRepository(supabase);
    await repo.delete(usage_id);
    return { usage_id };
  },
  { action: "DELETE", resource: "STORE_QUICK_SLOT_USAGE" }
);
