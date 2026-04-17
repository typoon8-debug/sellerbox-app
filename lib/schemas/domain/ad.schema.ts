import { z } from "zod";

// ─── 공통 ─────────────────────────────────────────────────────────────────────
export const adPlacementEnum = z.enum(["HERO", "MID_1", "MID_2", "FOOTER"]);

// ─── 광고 콘텐츠 스키마 ────────────────────────────────────────────────────────
export const createAdContentSchema = z.object({
  placement_id: adPlacementEnum,
  store_id: z.string().min(1),
  title: z.string().min(1, "광고 제목을 입력해 주세요."),
  ad_image: z.string().url().optional().nullable(),
  click_url: z.string().url("올바른 URL 형식이 아닙니다.").optional().nullable(),
  priority: z.number().int().min(0).default(0),
  status: z.enum(["DRAFT", "READY", "ACTIVE", "PAUSED", "ENDED"]).default("DRAFT"),
});

export const updateAdContentSchema = createAdContentSchema.partial().extend({
  content_id: z.string().min(1),
});

export const softDeleteAdContentSchema = z.object({
  content_id: z.string().min(1),
});

export const fetchAdContentsByStoreSchema = z.object({
  store_id: z.string().min(1),
});

export const fetchAdContentTabsSchema = z.object({
  content_id: z.string().min(1),
});

// ─── 광고 일정 스키마 ──────────────────────────────────────────────────────────
export const createAdScheduleSchema = z.object({
  content_id: z.string().min(1),
  store_id: z.string().min(1),
  start_at: z.string().min(1, "시작일을 입력해 주세요."),
  end_at: z.string().min(1, "종료일을 입력해 주세요."),
  time_start: z.string().optional().nullable(),
  time_end: z.string().optional().nullable(),
  dow_mask: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
  status: z.enum(["SCHEDULED", "ACTIVE", "PAUSED", "ENDED"]).default("SCHEDULED"),
  weight: z.number().min(0).optional().nullable(),
});

export const updateAdScheduleSchema = createAdScheduleSchema.partial().extend({
  schedule_id: z.string().min(1),
});

export const deleteAdScheduleSchema = z.object({
  schedule_id: z.string().min(1),
});

// ─── 광고 타겟 스키마 ──────────────────────────────────────────────────────────
export const createAdTargetSchema = z.object({
  content_id: z.string().min(1),
  store_id: z.string().min(1),
  os: z.enum(["IOS", "ANDROID", "WEB"]).optional().nullable(),
  app_version_min: z.string().optional().nullable(),
  app_version_max: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  user_segment: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  // 한도 필드 (타겟 저장 시 ad_cap upsert)
  max_impressions_total: z.number().int().min(0).optional().nullable(),
  max_impressions_per_user_day: z.number().int().min(0).optional().nullable(),
  max_clicks_total: z.number().int().min(0).optional().nullable(),
});

export const updateAdTargetSchema = createAdTargetSchema.partial().extend({
  target_id: z.string().min(1),
});

export const deleteAdTargetSchema = z.object({
  target_id: z.string().min(1),
});

// ─── 광고 한도 스키마 (직접 사용 시 호환) ────────────────────────────────────────
export const createAdCapSchema = z.object({
  content_id: z.string().min(1),
  store_id: z.string().min(1),
  max_impressions_total: z.number().int().min(1).optional().nullable(),
  max_impressions_per_user_day: z.number().int().min(1).optional().nullable(),
  max_clicks_total: z.number().int().min(1).optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const updateAdCapSchema = createAdCapSchema.partial().extend({
  cap_id: z.string().min(1),
});

export const deleteAdCapSchema = z.object({
  cap_id: z.string().min(1),
});

// ─── 타입 export ──────────────────────────────────────────────────────────────
export type CreateAdContentInput = z.infer<typeof createAdContentSchema>;
export type UpdateAdContentInput = z.infer<typeof updateAdContentSchema>;
export type CreateAdScheduleInput = z.infer<typeof createAdScheduleSchema>;
export type UpdateAdScheduleInput = z.infer<typeof updateAdScheduleSchema>;
export type CreateAdTargetInput = z.infer<typeof createAdTargetSchema>;
export type UpdateAdTargetInput = z.infer<typeof updateAdTargetSchema>;
export type CreateAdCapInput = z.infer<typeof createAdCapSchema>;
export type UpdateAdCapInput = z.infer<typeof updateAdCapSchema>;
