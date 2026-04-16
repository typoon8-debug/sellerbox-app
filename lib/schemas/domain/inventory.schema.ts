import { z } from "zod";

export const adjustInventorySchema = z.object({
  inventory_id: z.string().min(1, "올바른 재고 ID를 입력해 주세요."),
  type: z.enum(["INBOUND", "ADJUST"], {
    error: "조정 유형을 선택해 주세요.",
  }),
  quantity: z.number().int("수량은 정수여야 합니다.").min(1, "수량은 1 이상이어야 합니다."),
  reason: z.string().optional(),
});

export type AdjustInventoryInput = z.infer<typeof adjustInventorySchema>;

/** 트랜잭션 이력 조회 스키마 */
export const getInventoryTxnListSchema = z.object({
  inventory_id: z.string().min(1, "올바른 재고 ID를 입력해 주세요."),
});

export type GetInventoryTxnListInput = z.infer<typeof getInventoryTxnListSchema>;

// ─── 재고관리 화면 전용 스키마 ────────────────────────────────────────────────

/** 재고관리 화면 - 상품 목록 검색 */
export const fetchItemsForInventorySchema = z.object({
  store_id: z.string().min(1),
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(200).default(50),
});
export type FetchItemsForInventoryInput = z.infer<typeof fetchItemsForInventorySchema>;

/** 재고관리 화면 - 가게별 재고 목록 조회 (검색 조건 동시 적용) */
export const fetchInventoryByStoreSchema = z.object({
  store_id: z.string().min(1),
  category: z.string().optional(),
  search: z.string().optional(),
});
export type FetchInventoryByStoreInput = z.infer<typeof fetchInventoryByStoreSchema>;

/** 재고 일괄 생성 - 선택 상품 → 재고 레코드 생성 */
export const createInventoryBatchSchema = z.object({
  store_id: z.string().min(1),
  items: z
    .array(
      z.object({
        item_id: z.string().min(1),
        on_hand: z.number().int().min(0).default(0),
        safety_stock: z.number().int().min(0).default(0),
      })
    )
    .min(1, "하나 이상의 상품을 선택해 주세요."),
});
export type CreateInventoryBatchInput = z.infer<typeof createInventoryBatchSchema>;

/** 재고 수량 일괄 저장 - on_hand / safety_stock 변경분 */
export const updateInventoryBatchSchema = z.object({
  updates: z
    .array(
      z.object({
        inventory_id: z.string().min(1),
        on_hand: z.number().int().min(0),
        safety_stock: z.number().int().min(0),
      })
    )
    .min(1, "변경된 항목이 없습니다."),
});
export type UpdateInventoryBatchInput = z.infer<typeof updateInventoryBatchSchema>;

/** 재고 비활성화 - 선택 재고 INACTIVE 처리 */
export const deactivateInventoryBatchSchema = z.object({
  inventory_ids: z.array(z.string().min(1)).min(1, "비활성화할 재고를 선택해 주세요."),
});
export type DeactivateInventoryBatchInput = z.infer<typeof deactivateInventoryBatchSchema>;
