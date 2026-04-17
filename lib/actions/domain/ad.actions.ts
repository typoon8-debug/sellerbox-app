"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdContentRepository } from "@/lib/repositories/ad-content.repository";
import { AdScheduleRepository } from "@/lib/repositories/ad-schedule.repository";
import { AdTargetRepository } from "@/lib/repositories/ad-target.repository";
import { AdCapRepository } from "@/lib/repositories/ad-cap.repository";
import { AdLogRepository } from "@/lib/repositories/ad-log.repository";
import {
  createAdContentSchema,
  updateAdContentSchema,
  softDeleteAdContentSchema,
  fetchAdContentsByStoreSchema,
  fetchAdContentTabsSchema,
  createAdScheduleSchema,
  updateAdScheduleSchema,
  deleteAdScheduleSchema,
  createAdTargetSchema,
  updateAdTargetSchema,
  deleteAdTargetSchema,
  createAdCapSchema,
  updateAdCapSchema,
  deleteAdCapSchema,
} from "@/lib/schemas/domain/ad.schema";
import { z } from "zod";

// ─── 광고 콘텐츠 ──────────────────────────────────────────────────────────────

/** 가게별 광고 콘텐츠 목록 조회 */
export const fetchAdContentsByStore = withAction(
  fetchAdContentsByStoreSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new AdContentRepository(supabase);
    return repo.findByStoreId(input.store_id);
  },
  { action: "READ", resource: "AD_CONTENT" }
);

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

/** 광고 콘텐츠 수정 */
export const updateAdContent = withAction(
  updateAdContentSchema,
  async (input) => {
    const { content_id, ...rest } = input;
    const supabase = createAdminClient();
    const repo = new AdContentRepository(supabase);
    return repo.update(content_id, { ...rest, updated_at: new Date().toISOString() });
  },
  { action: "UPDATE", resource: "AD_CONTENT" }
);

/** 광고 콘텐츠 소프트 삭제 (status=ENDED) */
export const softDeleteAdContent = withAction(
  softDeleteAdContentSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new AdContentRepository(supabase);
    return repo.softDelete(input.content_id);
  },
  { action: "DELETE", resource: "AD_CONTENT" }
);

/** 콘텐츠 선택 시 탭 데이터 일괄 조회 (일정·타겟·한도·로그) */
export const fetchAdContentTabs = withAction(
  fetchAdContentTabsSchema,
  async (input) => {
    const supabase = createAdminClient();
    const [schedules, targets, caps, logs] = await Promise.all([
      new AdScheduleRepository(supabase).findByContentId(input.content_id),
      new AdTargetRepository(supabase).findByContentId(input.content_id),
      new AdCapRepository(supabase).findByContentId(input.content_id),
      new AdLogRepository(supabase).findByContentId(input.content_id),
    ]);
    return { schedules, targets, caps, logs };
  },
  { action: "READ", resource: "AD_CONTENT_TABS" }
);

// ─── 광고 일정 ────────────────────────────────────────────────────────────────

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

/** 광고 일정 수정 */
export const updateAdSchedule = withAction(
  updateAdScheduleSchema,
  async (input) => {
    const { schedule_id, ...rest } = input;
    const supabase = createAdminClient();
    const repo = new AdScheduleRepository(supabase);
    return repo.update(schedule_id, rest);
  },
  { action: "UPDATE", resource: "AD_SCHEDULE" }
);

/** 광고 일정 삭제 */
export const deleteAdSchedule = withAction(
  deleteAdScheduleSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new AdScheduleRepository(supabase);
    return repo.delete(input.schedule_id);
  },
  { action: "DELETE", resource: "AD_SCHEDULE" }
);

// ─── 광고 타겟 + 한도 (통합 저장) ───────────────────────────────────────────────

/** 광고 타겟 생성 (+ 한도 필드 있으면 ad_cap upsert) */
export const createAdTarget = withAction(
  createAdTargetSchema,
  async (input) => {
    const {
      max_impressions_total,
      max_impressions_per_user_day,
      max_clicks_total,
      ...targetInput
    } = input;
    const supabase = createAdminClient();
    const targetRepo = new AdTargetRepository(supabase);
    const target = await targetRepo.create(targetInput);

    const hasCapFields =
      max_impressions_total != null ||
      max_impressions_per_user_day != null ||
      max_clicks_total != null;

    if (hasCapFields) {
      const capRepo = new AdCapRepository(supabase);
      await capRepo.create({
        content_id: targetInput.content_id,
        store_id: targetInput.store_id,
        max_impressions_total: max_impressions_total ?? null,
        max_impressions_per_user_day: max_impressions_per_user_day ?? null,
        max_clicks_total: max_clicks_total ?? null,
        status: "ACTIVE",
      });
    }
    return target;
  },
  { action: "CREATE", resource: "AD_TARGET" }
);

/** 광고 타겟 수정 */
export const updateAdTarget = withAction(
  updateAdTargetSchema,
  async (input) => {
    const {
      target_id,
      max_impressions_total,
      max_impressions_per_user_day,
      max_clicks_total,
      ...rest
    } = input;
    const supabase = createAdminClient();
    const targetRepo = new AdTargetRepository(supabase);
    const updated = await targetRepo.update(target_id, rest);

    const hasCapFields =
      max_impressions_total !== undefined ||
      max_impressions_per_user_day !== undefined ||
      max_clicks_total !== undefined;

    if (hasCapFields && rest.content_id) {
      const capRepo = new AdCapRepository(supabase);
      const caps = await capRepo.findByContentId(rest.content_id);
      if (caps.length > 0) {
        await capRepo.update(caps[0].cap_id, {
          max_impressions_total: max_impressions_total ?? null,
          max_impressions_per_user_day: max_impressions_per_user_day ?? null,
          max_clicks_total: max_clicks_total ?? null,
        });
      }
    }
    return updated;
  },
  { action: "UPDATE", resource: "AD_TARGET" }
);

/** 광고 타겟 삭제 */
export const deleteAdTarget = withAction(
  deleteAdTargetSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new AdTargetRepository(supabase);
    return repo.delete(input.target_id);
  },
  { action: "DELETE", resource: "AD_TARGET" }
);

// ─── 광고 한도 (직접 CRUD) ────────────────────────────────────────────────────

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

/** 광고 한도 수정 */
export const updateAdCap = withAction(
  updateAdCapSchema,
  async (input) => {
    const { cap_id, ...rest } = input;
    const supabase = createAdminClient();
    const repo = new AdCapRepository(supabase);
    return repo.update(cap_id, rest);
  },
  { action: "UPDATE", resource: "AD_CAP" }
);

/** 광고 한도 삭제 */
export const deleteAdCap = withAction(
  deleteAdCapSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new AdCapRepository(supabase);
    return repo.delete(input.cap_id);
  },
  { action: "DELETE", resource: "AD_CAP" }
);

/** 광고 로그 조회 (콘텐츠 + 기간 + 액션 필터) */
export const fetchAdLogs = withAction(
  z.object({
    content_id: z.string().min(1),
    from: z.string().optional(),
    to: z.string().optional(),
    action: z.string().optional(),
  }),
  async (input) => {
    const supabase = createAdminClient();
    const repo = new AdLogRepository(supabase);
    return repo.findByContentId(input.content_id, {
      from: input.from,
      to: input.to,
      action: input.action,
    });
  },
  { action: "READ", resource: "AD_LOG" }
);
