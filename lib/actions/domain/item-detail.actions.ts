"use server";

import { z } from "zod";
import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { ItemDetailRepository } from "@/lib/repositories/item-detail.repository";
import { ItemRepository } from "@/lib/repositories/item.repository";
import {
  createItemDetailSchema,
  updateItemDetailSchema,
  deleteItemDetailSchema,
} from "@/lib/schemas/domain/item-detail.schema";

const fetchItemDetailByItemSchema = z.object({
  item_id: z.string().uuid("올바른 상품 ID를 입력해 주세요."),
});

const fetchItemsByStoreSchema = z.object({
  store_id: z.string().uuid("올바른 가게 ID를 입력해 주세요."),
  category: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(50),
});

/** 상품설명 생성 */
export const createItemDetail = withAction(
  createItemDetailSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new ItemDetailRepository(supabase);
    return repo.create(input);
  },
  { action: "CREATE", resource: "ITEM_DETAIL" }
);

/** 상품설명 수정 */
export const updateItemDetail = withAction(
  updateItemDetailSchema,
  async ({ item_detail_id, ...rest }) => {
    const supabase = createAdminClient();
    const repo = new ItemDetailRepository(supabase);
    return repo.update(item_detail_id, rest);
  },
  { action: "UPDATE", resource: "ITEM_DETAIL" }
);

/** 상품설명 소프트 삭제 (status → INACTIVE) */
export const softDeleteItemDetail = withAction(
  deleteItemDetailSchema,
  async ({ item_detail_id }) => {
    const supabase = createAdminClient();
    const repo = new ItemDetailRepository(supabase);
    return repo.softDelete(item_detail_id);
  },
  { action: "DELETE", resource: "ITEM_DETAIL" }
);

/** 상품 ID로 상품설명 조회 */
export const fetchItemDetailByItem = withAction(
  fetchItemDetailByItemSchema,
  async ({ item_id }) => {
    const supabase = createAdminClient();
    const repo = new ItemDetailRepository(supabase);
    return repo.findByItemId(item_id);
  }
);

/** 가게별 상품 목록 조회 (상품설명 관리 화면의 상품 그리드용) */
export const fetchItemsByStore = withAction(
  fetchItemsByStoreSchema,
  async ({ store_id, category, page, pageSize }) => {
    const supabase = createAdminClient();
    const repo = new ItemRepository(supabase);
    const filters: Record<string, string> = { store_id };
    if (category && category !== "ALL") {
      filters.category_code_value = category;
    }
    return repo.paginate({ page, pageSize, filters });
  }
);
