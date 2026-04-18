"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type CategoryOption = { value: string; label: string };

/**
 * tenant.code(= store_category_code)에 해당하는 카테고리 목록 조회.
 * common_code.code = storeCategoryCode → common_code_value 목록 반환.
 */
export async function getCategoriesByCode(storeCategoryCode: string): Promise<CategoryOption[]> {
  if (!storeCategoryCode) return [];

  const supabase = createAdminClient();

  const { data: commonCode } = await supabase
    .from("common_code")
    .select("id")
    .eq("code", storeCategoryCode)
    .single();

  if (!commonCode) return [];

  const { data: values } = await supabase
    .from("common_code_value")
    .select("value, label")
    .eq("common_code_id", commonCode.id)
    .order("sort_order", { ascending: true });

  return (values ?? []).map((v) => ({ value: v.value, label: v.label }));
}
