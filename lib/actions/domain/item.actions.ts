"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { ItemRepository } from "@/lib/repositories/item.repository";
import {
  createItemSchema,
  updateItemSchema,
  deleteItemSchema,
} from "@/lib/schemas/domain/item.schema";

/** 상품 생성 */
export const createItem = withAction(
  createItemSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new ItemRepository(supabase);
    return repo.create(input);
  },
  { action: "CREATE", resource: "ITEM" }
);

/** 상품 수정 */
export const updateItem = withAction(
  updateItemSchema,
  async ({ item_id, ...rest }) => {
    const supabase = createAdminClient();
    const repo = new ItemRepository(supabase);
    return repo.update(item_id, rest);
  },
  { action: "UPDATE", resource: "ITEM" }
);

/** 상품 삭제 */
export const deleteItem = withAction(
  deleteItemSchema,
  async ({ item_id }) => {
    const supabase = createAdminClient();
    const repo = new ItemRepository(supabase);
    await repo.delete(item_id);
    return { item_id };
  },
  { action: "DELETE", resource: "ITEM" }
);
