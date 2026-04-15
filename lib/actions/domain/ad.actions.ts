"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdContentRepository } from "@/lib/repositories/ad-content.repository";
import { AdScheduleRepository } from "@/lib/repositories/ad-schedule.repository";
import { AdTargetRepository } from "@/lib/repositories/ad-target.repository";
import { AdCapRepository } from "@/lib/repositories/ad-cap.repository";
import {
  createAdContentSchema,
  createAdScheduleSchema,
  createAdTargetSchema,
  createAdCapSchema,
} from "@/lib/schemas/domain/ad.schema";

/** 광고 콘텐츠 생성 */
export const createAdContent = withAction(
  createAdContentSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new AdContentRepository(supabase);
    return repo.create(input);
  },
  { action: "CREATE", resource: "AD_CONTENT" }
);

/** 광고 일정 생성 */
export const createAdSchedule = withAction(
  createAdScheduleSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new AdScheduleRepository(supabase);
    return repo.create(input);
  },
  { action: "CREATE", resource: "AD_SCHEDULE" }
);

/** 광고 타겟 생성 */
export const createAdTarget = withAction(
  createAdTargetSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new AdTargetRepository(supabase);
    return repo.create(input);
  },
  { action: "CREATE", resource: "AD_TARGET" }
);

/** 광고 한도 생성 */
export const createAdCap = withAction(
  createAdCapSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new AdCapRepository(supabase);
    return repo.create(input);
  },
  { action: "CREATE", resource: "AD_CAP" }
);
