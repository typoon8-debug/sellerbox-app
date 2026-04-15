"use client";

import { useCallback, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface TableQueryState {
  page: number;
  search: string;
  sort: string; // "column:asc" | "column:desc"
}

interface UseTableQueryStateReturn {
  state: TableQueryState;
  isPending: boolean;
  setPage: (page: number) => void;
  setSearch: (search: string | undefined) => void;
  setSort: (key: string, direction: "asc" | "desc") => void;
  buildUrl: (overrides: Record<string, string | undefined>) => string;
}

/**
 * 테이블의 page/search/sort 상태를 URL 쿼리 파라미터에 동기화하는 훅
 *
 * 여러 테이블 client 컴포넌트에서 반복되는 buildUrl + useSearchParams + startTransition 패턴을 통합
 *
 * @param defaultSort - 기본 정렬값 (예: "created_at:desc")
 */
export function useTableQueryState(defaultSort = "created_at:desc"): UseTableQueryStateReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const state: TableQueryState = {
    page: Math.max(1, Number(searchParams.get("page") ?? "1") || 1),
    search: searchParams.get("q") ?? "",
    sort: searchParams.get("sort") ?? defaultSort,
  };

  const buildUrl = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(overrides)) {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [searchParams, pathname]
  );

  const setPage = useCallback(
    (page: number) => {
      startTransition(() => {
        router.push(buildUrl({ page: String(page) }));
      });
    },
    [router, buildUrl]
  );

  const setSearch = useCallback(
    (search: string | undefined) => {
      startTransition(() => {
        router.push(buildUrl({ q: search || undefined, page: undefined }));
      });
    },
    [router, buildUrl]
  );

  const setSort = useCallback(
    (key: string, direction: "asc" | "desc") => {
      startTransition(() => {
        router.push(buildUrl({ sort: `${key}:${direction}`, page: undefined }));
      });
    },
    [router, buildUrl]
  );

  return { state, isPending, setPage, setSearch, setSort, buildUrl };
}
