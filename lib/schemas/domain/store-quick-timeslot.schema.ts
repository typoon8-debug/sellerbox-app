import { z } from "zod";

export const createQuickTimeslotSchema = z.object({
  store_id: z.string().uuid("올바른 가게 ID를 입력해 주세요."),
  depart_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "HH:MM 형식으로 입력해 주세요."),
  day_type: z.string().max(20).default("ALL"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const updateQuickTimeslotSchema = z.object({
  schedule_id: z.string().uuid("올바른 스케줄 ID를 입력해 주세요."),
  depart_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "HH:MM 형식으로 입력해 주세요.")
    .optional(),
  day_type: z.string().max(20).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const deleteQuickTimeslotSchema = z.object({
  schedule_id: z.string().uuid("올바른 스케줄 ID를 입력해 주세요."),
});

export type CreateQuickTimeslotInput = z.infer<typeof createQuickTimeslotSchema>;
export type UpdateQuickTimeslotInput = z.infer<typeof updateQuickTimeslotSchema>;
export type DeleteQuickTimeslotInput = z.infer<typeof deleteQuickTimeslotSchema>;
