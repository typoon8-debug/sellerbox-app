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

export const fetchShipmentsSchema = z.object({
  store_id: z.string().uuid("올바른 가게 ID를 입력해 주세요."),
  from_date: z.string().min(1, "시작 날짜를 입력해 주세요."),
  to_date: z.string().min(1, "종료 날짜를 입력해 주세요."),
});

export const fetchBbqGroupsSchema = z.object({
  store_id: z.string().uuid("올바른 가게 ID를 입력해 주세요."),
  from_date: z.string().min(1, "시작 날짜를 입력해 주세요."),
  to_date: z.string().min(1, "종료 날짜를 입력해 주세요."),
});

export const batchDeliverySchema = z.object({
  shipment_ids: z.array(z.string().uuid()).min(1, "최소 1건 이상 선택해 주세요."),
});

export type CreateDispatchRequestInput = z.infer<typeof createDispatchRequestSchema>;
export type CloseSlotInput = z.infer<typeof closeSlotSchema>;
export type FetchShipmentsInput = z.infer<typeof fetchShipmentsSchema>;
export type FetchBbqGroupsInput = z.infer<typeof fetchBbqGroupsSchema>;
export type BatchDeliveryInput = z.infer<typeof batchDeliverySchema>;
