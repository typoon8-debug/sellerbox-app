import { z } from "zod";

export const updateOrderStatusSchema = z.object({
  order_id: z.string().uuid("올바른 주문 ID를 입력해 주세요."),
  status: z.enum(
    ["CREATED", "PAID", "PACKING", "DISPATCHED", "DELIVERING", "DELIVERED", "CANCELED", "REFUNDED"],
    { error: "주문 상태를 선택해 주세요." }
  ),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
