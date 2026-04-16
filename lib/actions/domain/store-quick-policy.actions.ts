"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { StoreQuickPolicyRepository } from "@/lib/repositories/store-quick-policy.repository";
import {
  createQuickPolicySchema,
  updateQuickPolicySchema,
  deleteQuickPolicySchema,
} from "@/lib/schemas/domain/store-quick-policy.schema";

/** 바로퀵 정책 생성 */
export const createQuickPolicy = withAction(
  createQuickPolicySchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new StoreQuickPolicyRepository(supabase);
    return repo.create(input);
  },
  { action: "CREATE", resource: "STORE_QUICK_POLICY" }
);

/** 바로퀵 정책 수정 */
export const updateQuickPolicy = withAction(
  updateQuickPolicySchema,
  async ({ policy_id, ...rest }) => {
    const supabase = createAdminClient();
    const repo = new StoreQuickPolicyRepository(supabase);
    return repo.update(policy_id, rest);
  },
  { action: "UPDATE", resource: "STORE_QUICK_POLICY" }
);

/** 바로퀵 정책 삭제 */
export const deleteQuickPolicy = withAction(
  deleteQuickPolicySchema,
  async ({ policy_id }) => {
    const supabase = createAdminClient();
    const repo = new StoreQuickPolicyRepository(supabase);
    await repo.delete(policy_id);
    return { policy_id };
  },
  { action: "DELETE", resource: "STORE_QUICK_POLICY" }
);
