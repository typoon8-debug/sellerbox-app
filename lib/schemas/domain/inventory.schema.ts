import { z } from "zod";

export const adjustInventorySchema = z.object({
  inventory_id: z.string().uuid("올바른 재고 ID를 입력해 주세요."),
  type: z.enum(["INBOUND", "ADJUST"], {
    error: "조정 유형을 선택해 주세요.",
  }),
  quantity: z.number().int("수량은 정수여야 합니다.").min(1, "수량은 1 이상이어야 합니다."),
  reason: z.string().optional(),
});

export type AdjustInventoryInput = z.infer<typeof adjustInventorySchema>;

/** 트랜잭션 이력 조회 스키마 */
export const getInventoryTxnListSchema = z.object({
  inventory_id: z.string().uuid("올바른 재고 ID를 입력해 주세요."),
});

export type GetInventoryTxnListInput = z.infer<typeof getInventoryTxnListSchema>;
