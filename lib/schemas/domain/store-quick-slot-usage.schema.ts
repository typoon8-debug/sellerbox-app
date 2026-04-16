import { z } from "zod";

export const createSlotUsageSchema = z.object({
  store_id: z.string().uuid("올바른 가게 ID를 입력해 주세요."),
  depart_date: z.string().min(1, "출발 날짜를 입력해 주세요."),
  depart_time: z.string().min(1, "출발 시간을 입력해 주세요."),
  reserved_count: z.number().int().min(0).default(0),
});

export const updateSlotUsageSchema = z.object({
  usage_id: z.string().uuid("올바른 사용량 ID를 입력해 주세요."),
  reserved_count: z.number().int().min(0).optional(),
});

export const deleteSlotUsageSchema = z.object({
  usage_id: z.string().uuid("올바른 사용량 ID를 입력해 주세요."),
});

export type CreateSlotUsageInput = z.infer<typeof createSlotUsageSchema>;
export type UpdateSlotUsageInput = z.infer<typeof updateSlotUsageSchema>;
export type DeleteSlotUsageInput = z.infer<typeof deleteSlotUsageSchema>;
