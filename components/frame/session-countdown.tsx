"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSessionStore, formatSessionTime } from "@/lib/stores/session-store";

export function SessionCountdown() {
  const router = useRouter();
  const { remainingSeconds, isExpired, tick, extend } = useSessionStore();

  useEffect(() => {
    const timer = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(timer);
  }, [tick]);

  useEffect(() => {
    if (isExpired) {
      toast.error("세션이 만료되었습니다. 다시 로그인해 주세요.");
      router.push("/login");
    }
  }, [isExpired, router]);

  // 3분 미만이면 경고색
  const isWarning = remainingSeconds < 180;

  const handleExtend = () => {
    extend();
    toast.success("세션이 15분 연장되었습니다.");
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`font-mono text-sm tabular-nums ${
          isWarning ? "text-alert-red font-semibold" : "text-text-placeholder"
        }`}
      >
        {formatSessionTime(remainingSeconds)}
      </span>
      <Button variant="outline-gray" size="sm" onClick={handleExtend}>
        연장
      </Button>
    </div>
  );
}
