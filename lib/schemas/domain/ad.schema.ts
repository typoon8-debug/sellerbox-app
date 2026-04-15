import { z } from "zod";

export const createAdContentSchema = z.object({
  placement_id: z.string().min(1, "게재 위치 ID를 입력해 주세요."),
  store_id: z.string().uuid(),
  title: z.string().min(1, "광고 제목을 입력해 주세요."),
  ad_image: z.string().url().optional().nullable(),
  click_url: z.string().url("올바른 URL 형식이 아닙니다.").optional().nullable(),
  priority: z.number().int().min(0).default(0),
  status: z.enum(["DRAFT", "READY", "ACTIVE", "PAUSED", "ENDED"]).default("DRAFT"),
});

export const createAdScheduleSchema = z.object({
  content_id: z.string().uuid(),
  store_id: z.string().uuid(),
  start_at: z.string().min(1, "시작일을 입력해 주세요."),
  end_at: z.string().min(1, "종료일을 입력해 주세요."),
  time_start: z.string().optional().nullable(),
  time_end: z.string().optional().nullable(),
  dow_mask: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
  status: z.enum(["SCHEDULED", "ACTIVE", "PAUSED", "ENDED"]).default("SCHEDULED"),
  weight: z.number().min(0).optional().nullable(),
});

export const createAdTargetSchema = z.object({
  content_id: z.string().uuid(),
  store_id: z.string().uuid(),
  os: z.enum(["IOS", "ANDROID", "WEB"]).optional().nullable(),
  app_version_min: z.string().optional().nullable(),
  app_version_max: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  user_segment: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const createAdCapSchema = z.object({
  content_id: z.string().uuid(),
  store_id: z.string().uuid(),
  max_impressions_total: z.number().int().min(1).optional().nullable(),
  max_impressions_per_user_day: z.number().int().min(1).optional().nullable(),
  max_clicks_total: z.number().int().min(1).optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type CreateAdContentInput = z.infer<typeof createAdContentSchema>;
export type CreateAdScheduleInput = z.infer<typeof createAdScheduleSchema>;
export type CreateAdTargetInput = z.infer<typeof createAdTargetSchema>;
export type CreateAdCapInput = z.infer<typeof createAdCapSchema>;
