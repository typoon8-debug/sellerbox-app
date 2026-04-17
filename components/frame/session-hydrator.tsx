"use client";

import { useEffect } from "react";
import { useUserSessionStore } from "@/lib/stores/user-session-store";

interface SessionHydratorProps {
  sellerId: string | null;
  storeId: string | null;
  tenantId: string | null;
  stores: { store_id: string; tenant_id: string | null; name: string }[];
}

/** 서버에서 조회한 세션 정보를 Zustand 스토어에 주입하는 side-effect 컴포넌트 */
export function SessionHydrator({ sellerId, storeId, tenantId, stores }: SessionHydratorProps) {
  const setSession = useUserSessionStore((s) => s.setSession);

  useEffect(() => {
    setSession({ sellerId, storeId, tenantId, stores });
  }, [sellerId, storeId, tenantId, stores, setSession]);

  return null;
}
