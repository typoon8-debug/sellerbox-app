import { z } from "zod";

export const createDispatchRequestSchema = z.object({
  order_id: z.string().uuid("올바른 주문 ID를 입력해 주세요."),
  store_id: z.string().uuid("올바른 가게 ID를 입력해 주세요."),
});

export const closeSlotSchema = z.object({
  store_id: z.string().uuid("올바른 가게 ID를 입력해 주세요."),
  depart_date: z.string().min(1, "출발 날짜를 입력해 주세요."),
  depart_time: z.string().min(1, "출발 시간을 입력해 주세요."),
});

export type CreateDispatchRequestInput = z.infer<typeof createDispatchRequestSchema>;
export type CloseSlotInput = z.infer<typeof closeSlotSchema>;
