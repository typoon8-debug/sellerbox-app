"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { TenantRepository } from "@/lib/repositories/tenant.repository";
import {
  createTenantSchema,
  updateTenantSchema,
  deleteTenantSchema,
} from "@/lib/schemas/domain/tenant.schema";

/** 테넌트 생성 */
export const createTenant = withAction(
  createTenantSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new TenantRepository(supabase);
    return repo.create(input);
  },
  { action: "CREATE", resource: "TENANT" }
);

/** 테넌트 수정 */
export const updateTenant = withAction(
  updateTenantSchema,
  async ({ tenant_id, ...rest }) => {
    const supabase = createAdminClient();
    const repo = new TenantRepository(supabase);
    return repo.update(tenant_id, rest);
  },
  { action: "UPDATE", resource: "TENANT" }
);

/** 테넌트 삭제 */
export const deleteTenant = withAction(
  deleteTenantSchema,
  async ({ tenant_id }) => {
    const supabase = createAdminClient();
    const repo = new TenantRepository(supabase);
    await repo.delete(tenant_id);
    return { tenant_id };
  },
  { action: "DELETE", resource: "TENANT" }
);
