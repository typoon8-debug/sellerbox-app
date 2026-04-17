import { z } from "zod";

/** 가게 + 날짜범위로 주문 목록 조회 스키마 */
export const fetchOrdersForFulfillmentSchema = z.object({
  store_id: z.string().min(1, "가게를 선택해 주세요."),
  from_date: z.string().min(1, "시작 날짜를 입력해 주세요."),
  to_date: z.string().min(1, "종료 날짜를 입력해 주세요."),
  delivery_filter: z.string().optional(),
  page: z.number().int().positive().default(1),
  page_size: z.number().int().positive().default(50),
});

/** 주문 상세 아이템 조회 스키마 */
export const fetchOrderItemsWithInventorySchema = z.object({
  order_id: z.string().min(1, "주문 ID가 필요합니다."),
});

/** 대시보드 통계 조회 스키마 */
export const fetchDashboardStatsSchema = z.object({
  store_id: z.string().min(1, "가게 ID가 필요합니다."),
  date: z.string().min(1, "날짜가 필요합니다."),
});

/** 일괄 피킹 처리 스키마 */
export const batchStartPickingSchema = z.object({
  order_ids: z.array(z.string().min(1)).min(1, "최소 1건 이상 선택해 주세요."),
  store_id: z.string().min(1, "가게 ID가 필요합니다."),
});

/** 일괄 패킹 처리 스키마 */
export const batchCompletePackingSchema = z.object({
  order_ids: z.array(z.string().min(1)).min(1, "최소 1건 이상 선택해 주세요."),
});

/** 일괄 라벨 생성 스키마 */
export const batchGenerateLabelsSchema = z.object({
  order_ids: z.array(z.string().min(1)).min(1, "최소 1건 이상 선택해 주세요."),
});

/** 일괄 배송요청 생성 스키마 */
export const batchCreateDispatchRequestsSchema = z.object({
  order_ids: z.array(z.string().min(1)).min(1, "최소 1건 이상 선택해 주세요."),
  store_id: z.string().min(1, "가게 ID가 필요합니다."),
});

/** 주문 상태 수정 스키마 */
export const updateOrderStatusSchema = z.object({
  order_id: z.string().min(1, "주문 ID가 필요합니다."),
  status: z.enum([
    "CREATED",
    "PAID",
    "PACKING",
    "DISPATCHED",
    "DELIVERING",
    "DELIVERED",
    "CANCELED",
    "REFUNDED",
  ]),
});

/** 가게 + 날짜범위로 배송요청 목록 조회 스키마 */
export const fetchDispatchRequestsByStoreSchema = z.object({
  store_id: z.string().min(1, "가게 ID가 필요합니다."),
  from_date: z.string().min(1, "시작 날짜를 입력해 주세요."),
  to_date: z.string().min(1, "종료 날짜를 입력해 주세요."),
});

/** 주문처리 리스트 출력 데이터 조회 스키마 */
export const fetchPrintDataSchema = z.object({
  order_ids: z.array(z.string().min(1)).min(1, "출력할 주문을 선택해 주세요."),
});

/** 라벨 출력 데이터 조회 스키마 */
export const fetchLabelPrintDataSchema = z.object({
  order_ids: z.array(z.string().min(1)).min(1, "출력할 주문을 선택해 주세요."),
});

export type FetchOrdersForFulfillmentInput = z.infer<typeof fetchOrdersForFulfillmentSchema>;
export type FetchOrderItemsWithInventoryInput = z.infer<typeof fetchOrderItemsWithInventorySchema>;
export type FetchDashboardStatsInput = z.infer<typeof fetchDashboardStatsSchema>;
export type BatchStartPickingInput = z.infer<typeof batchStartPickingSchema>;
export type BatchCompletePackingInput = z.infer<typeof batchCompletePackingSchema>;
export type BatchGenerateLabelsInput = z.infer<typeof batchGenerateLabelsSchema>;
export type BatchCreateDispatchRequestsInput = z.infer<typeof batchCreateDispatchRequestsSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type FetchDispatchRequestsByStoreInput = z.infer<typeof fetchDispatchRequestsByStoreSchema>;
export type FetchPrintDataInput = z.infer<typeof fetchPrintDataSchema>;
export type FetchLabelPrintDataInput = z.infer<typeof fetchLabelPrintDataSchema>;
