"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { StoreQuickTimeslotRepository } from "@/lib/repositories/store-quick-timeslot.repository";
import {
  createQuickTimeslotSchema,
  updateQuickTimeslotSchema,
  deleteQuickTimeslotSchema,
} from "@/lib/schemas/domain/store-quick-timeslot.schema";

/** 바로퀵 고정 운행표 생성 */
export const createQuickTimeslot = withAction(
  createQuickTimeslotSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new StoreQuickTimeslotRepository(supabase);
    return repo.create(input);
  },
  { action: "CREATE", resource: "STORE_QUICK_TIMESLOT" }
);

/** 바로퀵 고정 운행표 수정 */
export const updateQuickTimeslot = withAction(
  updateQuickTimeslotSchema,
  async ({ schedule_id, ...rest }) => {
    const supabase = createAdminClient();
    const repo = new StoreQuickTimeslotRepository(supabase);
    return repo.update(schedule_id, rest);
  },
  { action: "UPDATE", resource: "STORE_QUICK_TIMESLOT" }
);

/** 바로퀵 고정 운행표 삭제 */
export const deleteQuickTimeslot = withAction(
  deleteQuickTimeslotSchema,
  async ({ schedule_id }) => {
    const supabase = createAdminClient();
    const repo = new StoreQuickTimeslotRepository(supabase);
    await repo.delete(schedule_id);
    return { schedule_id };
  },
  { action: "DELETE", resource: "STORE_QUICK_TIMESLOT" }
);
