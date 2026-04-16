import { z } from "zod";

export const createQuickTimeslotSchema = z.object({
  store_id: z.string().uuid("올바른 가게 ID를 입력해 주세요."),
  label: z.string().min(1, "라벨을 입력해 주세요."),
  depart_time: z.string().min(1, "출발 시간을 입력해 주세요."),
  order_cutoff_min: z.number().int().min(0, "주문 마감(분 전)은 0 이상이어야 합니다."),
  dow_mask: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const updateQuickTimeslotSchema = z.object({
  slot_id: z.string().uuid("올바른 슬롯 ID를 입력해 주세요."),
  label: z.string().min(1).optional(),
  depart_time: z.string().optional(),
  order_cutoff_min: z.number().int().min(0).optional(),
  dow_mask: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const deleteQuickTimeslotSchema = z.object({
  slot_id: z.string().uuid("올바른 슬롯 ID를 입력해 주세요."),
});

export type CreateQuickTimeslotInput = z.infer<typeof createQuickTimeslotSchema>;
export type UpdateQuickTimeslotInput = z.infer<typeof updateQuickTimeslotSchema>;
export type DeleteQuickTimeslotInput = z.infer<typeof deleteQuickTimeslotSchema>;
