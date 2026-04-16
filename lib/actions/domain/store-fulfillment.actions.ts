"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { StoreFulfillmentRepository } from "@/lib/repositories/store-fulfillment.repository";
import {
  createStoreFulfillmentSchema,
  updateStoreFulfillmentSchema,
  deleteStoreFulfillmentSchema,
} from "@/lib/schemas/domain/store-fulfillment.schema";

/** 배송정보(풀필먼트) 생성 */
export const createStoreFulfillment = withAction(
  createStoreFulfillmentSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new StoreFulfillmentRepository(supabase);
    return repo.create(input);
  },
  { action: "CREATE", resource: "STORE_FULFILLMENT" }
);

/** 배송정보(풀필먼트) 수정 */
export const updateStoreFulfillment = withAction(
  updateStoreFulfillmentSchema,
  async ({ id, ...rest }) => {
    const supabase = createAdminClient();
    const repo = new StoreFulfillmentRepository(supabase);
    return repo.update(id, rest);
  },
  { action: "UPDATE", resource: "STORE_FULFILLMENT" }
);

/** 배송정보(풀필먼트) 삭제 */
export const deleteStoreFulfillment = withAction(
  deleteStoreFulfillmentSchema,
  async ({ id }) => {
    const supabase = createAdminClient();
    const repo = new StoreFulfillmentRepository(supabase);
    await repo.delete(id);
    return { id };
  },
  { action: "DELETE", resource: "STORE_FULFILLMENT" }
);
