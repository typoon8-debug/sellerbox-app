"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type TableName = keyof Database["public"]["Tables"];
type TableRow<T extends TableName> = Database["public"]["Tables"][T]["Row"];

/**
 * Supabase Realtime postgres_changes 구독 훅
 * INSERT 이벤트 발생 시 콜백을 호출합니다.
 *
 * @param table 구독할 테이블 이름
 * @param cb INSERT 이벤트 발생 시 호출되는 콜백
 */
export function useRealtimeChannel<T extends TableName>(
  table: T,
  cb: (payload: RealtimePostgresInsertPayload<TableRow<T>>) => void
): void {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: table as string },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => cb(payload as RealtimePostgresInsertPayload<TableRow<T>>)
      )
      .subscribe();

    // 컴포넌트 언마운트 시 채널 정리
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);
}
