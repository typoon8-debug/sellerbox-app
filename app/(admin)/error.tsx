"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * 관리자 페이지 공통 에러 바운더리
 * Next.js App Router error.tsx 컨벤션
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string; code?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 (추후 Sentry 등 연동 가능)
    console.error("[AdminError]", error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-12" role="alert">
      <div className="flex flex-col items-center gap-3">
        <AlertTriangle className="text-alert-red h-12 w-12" aria-hidden="true" />
        <h2 className="text-text-body text-xl font-semibold">페이지를 불러오지 못했습니다</h2>
        <p className="text-text-placeholder text-sm">
          {error.message || "알 수 없는 오류가 발생했습니다."}
        </p>
        {error.code && (
          <p className="text-text-placeholder font-mono text-xs">오류 코드: {error.code}</p>
        )}
      </div>
      <Button onClick={reset} variant="outline">
        다시 시도
      </Button>
    </div>
  );
}
