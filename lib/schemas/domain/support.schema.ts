import { z } from "zod";

export const updateCsTicketSchema = z.object({
  ticket_id: z.string().uuid("올바른 티켓 ID를 입력해 주세요."),
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]).optional(),
  cs_action: z.string().optional(),
});

export const fetchCsTicketsSchema = z.object({
  store_id: z.string().min(1, "가게를 선택해 주세요."),
  from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다."),
  to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다."),
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED", "ALL"]).default("OPEN"),
});

export const createCeoReviewSchema = z.object({
  reviewId: z.string().uuid("올바른 리뷰 ID를 입력해 주세요."),
  content: z.string().min(1, "답변 내용을 입력해 주세요."),
  status: z.enum(["VISIBLE", "HIDDEN", "DELETED"]).default("VISIBLE"),
});

export const updateCeoReviewSchema = z.object({
  ceo_reviewId: z.string().uuid("올바른 CEO 답변 ID를 입력해 주세요."),
  content: z.string().min(1, "답변 내용을 입력해 주세요.").optional(),
  status: z.enum(["VISIBLE", "HIDDEN", "DELETED"]).optional(),
});

export const fetchReviewsSchema = z.object({
  store_id: z.string().min(1, "가게를 선택해 주세요."),
  from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다."),
  to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다."),
  status: z.enum(["VISIBLE", "HIDDEN", "REPORTED", "DELETED", "ALL"]).default("ALL"),
});

export type UpdateCsTicketInput = z.infer<typeof updateCsTicketSchema>;
export type FetchCsTicketsInput = z.infer<typeof fetchCsTicketsSchema>;
export type CreateCeoReviewInput = z.infer<typeof createCeoReviewSchema>;
export type UpdateCeoReviewInput = z.infer<typeof updateCeoReviewSchema>;
export type FetchReviewsInput = z.infer<typeof fetchReviewsSchema>;
