"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { StoreRepository } from "@/lib/repositories/store.repository";
import {
  createStoreSchema,
  updateStoreSchema,
  deleteStoreSchema,
} from "@/lib/schemas/domain/store.schema";

/** 가게 생성 */
export const createStore = withAction(
  createStoreSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new StoreRepository(supabase);
    return repo.create(input);
  },
  { action: "CREATE", resource: "STORE" }
);

/** 가게 수정 */
export const updateStore = withAction(
  updateStoreSchema,
  async ({ store_id, ...rest }) => {
    const supabase = createAdminClient();
    const repo = new StoreRepository(supabase);
    return repo.update(store_id, rest);
  },
  { action: "UPDATE", resource: "STORE" }
);

/** 가게 삭제 */
export const deleteStore = withAction(
  deleteStoreSchema,
  async ({ store_id }) => {
    const supabase = createAdminClient();
    const repo = new StoreRepository(supabase);
    await repo.delete(store_id);
    return { store_id };
  },
  { action: "DELETE", resource: "STORE" }
);
