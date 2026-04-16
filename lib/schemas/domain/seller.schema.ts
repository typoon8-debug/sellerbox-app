import { z } from "zod";

export const createSellerSchema = z.object({
  store_id: z.string().uuid("올바른 가게 ID를 입력해 주세요."),
  email: z.string().email("올바른 이메일 형식을 입력해 주세요."),
  name: z.string().min(1, "판매원 이름을 입력해 주세요."),
  phone: z.string().optional(),
  role: z.enum(["OWNER", "MANAGER", "PICKER", "PACKER"]),
  is_active: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const updateSellerSchema = z.object({
  seller_id: z.string().uuid("올바른 판매원 ID를 입력해 주세요."),
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.enum(["OWNER", "MANAGER", "PICKER", "PACKER"]).optional(),
  is_active: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const deleteSellerSchema = z.object({
  seller_id: z.string().uuid("올바른 판매원 ID를 입력해 주세요."),
});

export type CreateSellerInput = z.infer<typeof createSellerSchema>;
export type UpdateSellerInput = z.infer<typeof updateSellerSchema>;
export type DeleteSellerInput = z.infer<typeof deleteSellerSchema>;
