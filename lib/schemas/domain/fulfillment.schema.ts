import { z } from "zod";

export const startPickingSchema = z.object({
  task_id: z.string().uuid("올바른 작업 ID를 입력해 주세요."),
  picker_id: z.string().uuid("올바른 피커 ID를 입력해 주세요."),
});

export const completePickingSchema = z.object({
  task_id: z.string().uuid("올바른 작업 ID를 입력해 주세요."),
  items: z
    .array(
      z.object({
        picking_item_id: z.string().uuid(),
        picked_qty: z.number().int().min(0),
        result: z.enum(["OK", "SHORT", "SUBSTITUTE"]),
        substitute_product_id: z.string().uuid().optional().nullable(),
        memo: z.string().optional().nullable(),
      })
    )
    .min(1, "피킹 항목이 최소 1개 이상이어야 합니다."),
});

export const completePackingSchema = z.object({
  pack_id: z.string().uuid("올바른 패킹 ID를 입력해 주세요."),
  packing_weight: z.number().positive("중량은 0보다 커야 합니다."),
});

export type StartPickingInput = z.infer<typeof startPickingSchema>;
export type CompletePickingInput = z.infer<typeof completePickingSchema>;
export type CompletePackingInput = z.infer<typeof completePackingSchema>;
