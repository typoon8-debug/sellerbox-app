import { z } from "zod";

export const createQuickPolicySchema = z.object({
  store_id: z.string().uuid("올바른 가게 ID를 입력해 주세요."),
  min_order_amount: z.number().int().min(0, "최소 주문 금액은 0 이상이어야 합니다."),
  daily_runs: z.number().int().min(1, "일일 운행 횟수는 1 이상이어야 합니다."),
  capacity_per_slot: z.number().int().min(1, "슬롯당 용량은 1 이상이어야 합니다."),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const updateQuickPolicySchema = z.object({
  policy_id: z.string().uuid("올바른 정책 ID를 입력해 주세요."),
  min_order_amount: z.number().int().min(0).optional(),
  daily_runs: z.number().int().min(1).optional(),
  capacity_per_slot: z.number().int().min(1).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const deleteQuickPolicySchema = z.object({
  policy_id: z.string().uuid("올바른 정책 ID를 입력해 주세요."),
});

export type CreateQuickPolicyInput = z.infer<typeof createQuickPolicySchema>;
export type UpdateQuickPolicyInput = z.infer<typeof updateQuickPolicySchema>;
export type DeleteQuickPolicyInput = z.infer<typeof deleteQuickPolicySchema>;
