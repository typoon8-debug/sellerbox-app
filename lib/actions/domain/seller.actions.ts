"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { SellerRepository } from "@/lib/repositories/seller.repository";
import {
  createSellerSchema,
  updateSellerSchema,
  deleteSellerSchema,
} from "@/lib/schemas/domain/seller.schema";

/** 판매원 생성 */
export const createSeller = withAction(
  createSellerSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new SellerRepository(supabase);
    return repo.create(input);
  },
  { action: "CREATE", resource: "SELLER" }
);

/** 판매원 수정 */
export const updateSeller = withAction(
  updateSellerSchema,
  async ({ seller_id, ...rest }) => {
    const supabase = createAdminClient();
    const repo = new SellerRepository(supabase);
    return repo.update(seller_id, rest);
  },
  { action: "UPDATE", resource: "SELLER" }
);

/** 판매원 삭제 */
export const deleteSeller = withAction(
  deleteSellerSchema,
  async ({ seller_id }) => {
    const supabase = createAdminClient();
    const repo = new SellerRepository(supabase);
    await repo.delete(seller_id);
    return { seller_id };
  },
  { action: "DELETE", resource: "SELLER" }
);
