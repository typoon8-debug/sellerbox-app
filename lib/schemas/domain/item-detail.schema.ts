import { z } from "zod";

export const createItemDetailSchema = z.object({
  item_id: z.string().uuid("올바른 상품 ID를 입력해 주세요."),
  store_id: z.string().uuid("올바른 가게 ID를 입력해 주세요."),
  description_short: z.string().optional().nullable(),
  item_img: z.string().optional().nullable(),
  item_thumbnail_small: z.string().optional().nullable(),
  item_thumbnail_big: z.string().optional().nullable(),
  item_detail_img_adv: z.string().optional().nullable(),
  item_detail_img_detail: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const updateItemDetailSchema = z.object({
  item_detail_id: z.string().uuid("올바른 상품설명 ID를 입력해 주세요."),
  description_short: z.string().optional().nullable(),
  item_img: z.string().optional().nullable(),
  item_thumbnail_small: z.string().optional().nullable(),
  item_thumbnail_big: z.string().optional().nullable(),
  item_detail_img_adv: z.string().optional().nullable(),
  item_detail_img_detail: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const deleteItemDetailSchema = z.object({
  item_detail_id: z.string().uuid("올바른 상품설명 ID를 입력해 주세요."),
});

export type CreateItemDetailInput = z.infer<typeof createItemDetailSchema>;
export type UpdateItemDetailInput = z.infer<typeof updateItemDetailSchema>;
export type DeleteItemDetailInput = z.infer<typeof deleteItemDetailSchema>;
