"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type SellerRow = Database["public"]["Tables"]["seller"]["Row"];

interface UseCurrentUserResult {
  seller: SellerRow | null;
  loading: boolean;
}

/** 현재 로그인한 seller 정보를 클라이언트에서 조회하는 훅 */
export function useCurrentUser(): UseCurrentUserResult {
  const [seller, setSeller] = useState<SellerRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeller = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("seller")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      setSeller(data);
      setLoading(false);
    };

    void fetchSeller();
  }, []);

  return { seller, loading };
}
