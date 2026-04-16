import { z } from "zod";

export const createStoreFulfillmentSchema = z.object({
  store_id: z.string().uuid("올바른 가게 ID를 입력해 주세요."),
  fulfillment_type: z.enum([
    "DELIVERY",
    "PICKUP",
    "BBQ",
    "RESERVE",
    "FRESH_MORNING",
    "SAME_DAY",
    "3P_DELIVERY",
    "NONE",
  ]),
  active: z.boolean().default(true),
});

export const updateStoreFulfillmentSchema = z.object({
  id: z.string().uuid("올바른 ID를 입력해 주세요."),
  fulfillment_type: z
    .enum([
      "DELIVERY",
      "PICKUP",
      "BBQ",
      "RESERVE",
      "FRESH_MORNING",
      "SAME_DAY",
      "3P_DELIVERY",
      "NONE",
    ])
    .optional(),
  active: z.boolean().optional(),
});

export const deleteStoreFulfillmentSchema = z.object({
  id: z.string().uuid("올바른 ID를 입력해 주세요."),
});

export type CreateStoreFulfillmentInput = z.infer<typeof createStoreFulfillmentSchema>;
export type UpdateStoreFulfillmentInput = z.infer<typeof updateStoreFulfillmentSchema>;
export type DeleteStoreFulfillmentInput = z.infer<typeof deleteStoreFulfillmentSchema>;
