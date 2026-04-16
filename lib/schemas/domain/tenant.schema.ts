import { z } from "zod";

export const createTenantSchema = z.object({
  name: z.string().min(1, "테넌트명을 입력해 주세요."),
  code: z.string().min(1, "테넌트 코드를 입력해 주세요."),
  type: z.string().optional().default("DEFAULT"),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE"),
});

export const updateTenantSchema = z.object({
  tenant_id: z.string().uuid("올바른 테넌트 ID를 입력해 주세요."),
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  type: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
});

export const deleteTenantSchema = z.object({
  tenant_id: z.string().uuid("올바른 테넌트 ID를 입력해 주세요."),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type DeleteTenantInput = z.infer<typeof deleteTenantSchema>;
