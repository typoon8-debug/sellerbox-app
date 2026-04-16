"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type OrderRow = Database["public"]["Tables"]["order"]["Row"];

/**
 * Web Audio API를 사용해 "딩동" 알림음 재생
 * - 외부 파일 불필요, 브라우저 autoplay 정책 준수
 */
function playDingDong(): void {
  try {
    const ctx = new AudioContext();
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.value = 0.4;

    // 딩 (높은 음)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.type = "sine";
    osc1.frequency.value = 880; // A5
    gain1.gain.setValueAtTime(0.6, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);

    // 동 (낮은 음, 0.25초 후)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.type = "sine";
    osc2.frequency.value = 660; // E5
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.25);
    gain2.gain.setValueAtTime(0.6, ctx.currentTime + 0.26);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc2.start(ctx.currentTime + 0.25);
    osc2.stop(ctx.currentTime + 0.8);

    // 컨텍스트 정리
    osc1.addEventListener("ended", () => {
      osc2.addEventListener("ended", () => {
        void ctx.close();
      });
    });
  } catch {
    // Web Audio API 미지원 환경 — 무시
  }
}

interface UseOrderRealtimeOptions {
  /** 구독할 가게 ID */
  storeId: string;
  /** 신규 주문 INSERT 시 호출되는 콜백 */
  onNewOrder: (order: OrderRow) => void;
  /** 구독 활성화 여부 (false이면 구독하지 않음) */
  enabled?: boolean;
}

/**
 * 특정 가게의 신규 주문 INSERT를 Supabase Realtime으로 구독하는 훅
 * - store_id 필터로 해당 가게 주문만 감지
 * - 알림 사운드 재생 (브라우저 autoplay 정책 고려)
 * - 탭이 비활성 상태일 때도 콜백은 호출하되 사운드는 재생하지 않음
 */
export function useOrderRealtime({
  storeId,
  onNewOrder,
  enabled = true,
}: UseOrderRealtimeOptions): void {
  // 사용자 인터랙션 여부 추적 (autoplay 정책 대응)
  const hasInteractedRef = useRef(false);
  const onNewOrderRef = useRef(onNewOrder);

  // 최신 콜백 참조 유지 (deps 배열 문제 방지)
  useEffect(() => {
    onNewOrderRef.current = onNewOrder;
  });

  // 사용자 인터랙션 감지
  useEffect(() => {
    const handleInteraction = () => {
      hasInteractedRef.current = true;
    };
    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !storeId) return;

    const supabase = createClient();
    const channelName = `order-realtime-${storeId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "order",
          filter: `store_id=eq.${storeId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const newOrder = payload.new as OrderRow;

          // 알림 사운드 재생 (탭이 활성 상태이고 사용자 인터랙션이 있을 때만)
          if (hasInteractedRef.current && document.visibilityState === "visible") {
            playDingDong();
          }

          onNewOrderRef.current(newOrder);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId, enabled]);
}
