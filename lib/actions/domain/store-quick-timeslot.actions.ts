"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { StoreQuickTimeslotRepository } from "@/lib/repositories/store-quick-timeslot.repository";
import {
  createQuickTimeslotSchema,
  updateQuickTimeslotSchema,
  deleteQuickTimeslotSchema,
} from "@/lib/schemas/domain/store-quick-timeslot.schema";

/** 운행 시간표(타임슬롯) 생성 */
export const createQuickTimeslot = withAction(
  createQuickTimeslotSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new StoreQuickTimeslotRepository(supabase);
    return repo.create(input);
  },
  { action: "CREATE", resource: "STORE_QUICK_TIMESLOT" }
);

/** 운행 시간표(타임슬롯) 수정 */
export const updateQuickTimeslot = withAction(
  updateQuickTimeslotSchema,
  async ({ slot_id, ...rest }) => {
    const supabase = createAdminClient();
    const repo = new StoreQuickTimeslotRepository(supabase);
    return repo.update(slot_id, rest);
  },
  { action: "UPDATE", resource: "STORE_QUICK_TIMESLOT" }
);

/** 운행 시간표(타임슬롯) 삭제 */
export const deleteQuickTimeslot = withAction(
  deleteQuickTimeslotSchema,
  async ({ slot_id }) => {
    const supabase = createAdminClient();
    const repo = new StoreQuickTimeslotRepository(supabase);
    await repo.delete(slot_id);
    return { slot_id };
  },
  { action: "DELETE", resource: "STORE_QUICK_TIMESLOT" }
);
