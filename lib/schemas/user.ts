import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(1, "이름을 입력해 주세요.").optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  role: z.enum(["ADMIN", "CUSTOMER", "SELLER", "RIDER"]).optional(),
  active: z.boolean().optional(),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: "비밀번호는 8자 이상이어야 합니다.",
    }),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
