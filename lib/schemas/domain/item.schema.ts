import { z } from "zod";

export const createItemSchema = z.object({
  store_id: z.string().uuid(),
  sku: z.string().min(1, "SKU를 입력해 주세요."),
  category_code_value: z.string().min(1, "카테고리 코드를 입력해 주세요."),
  category_name: z.string().min(1, "카테고리명을 입력해 주세요."),
  name: z.string().min(1, "상품명을 입력해 주세요."),
  list_price: z.number().int().min(0, "정가는 0원 이상이어야 합니다."),
  sale_price: z.number().int().min(0, "판매가는 0원 이상이어야 합니다."),
  item_picture_url: z.string().url().optional().nullable(),
  ranking_yn: z.enum(["Y", "N"]).default("N"),
  ranking: z.number().int().min(0).default(0),
  status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK", "DISCONTINUED"]).default("ACTIVE"),
});

export const updateItemSchema = z.object({
  item_id: z.string().uuid(),
  name: z.string().min(1).optional(),
  category_code_value: z.string().optional(),
  category_name: z.string().optional(),
  list_price: z.number().int().min(0).optional(),
  sale_price: z.number().int().min(0).optional(),
  item_picture_url: z.string().url().optional().nullable(),
  ranking_yn: z.enum(["Y", "N"]).optional(),
  ranking: z.number().int().min(0).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK", "DISCONTINUED"]).optional(),
});

export const deleteItemSchema = z.object({
  item_id: z.string().uuid(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type DeleteItemInput = z.infer<typeof deleteItemSchema>;
