"use client";

import { useState, useEffect } from "react";
import { getCategoriesByCode, type CategoryOption } from "@/lib/actions/domain/category.actions";

/**
 * tenant.code(store_category_code) 기반으로 카테고리 목록을 동적으로 불러오는 훅.
 * storeCategoryCode가 바뀔 때마다 DB에서 재조회.
 */
export function useCategoryOptions(storeCategoryCode: string | null | undefined) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!storeCategoryCode) {
      setCategories([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getCategoriesByCode(storeCategoryCode).then((cats) => {
      if (!cancelled) {
        setCategories(cats);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [storeCategoryCode]);

  return { categories, loading };
}
