"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * 루트 에러 바운더리 폴백
 * Next.js App Router error.tsx 컨벤션
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RootError]", error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div
          className="flex min-h-screen flex-col items-center justify-center gap-6 p-12"
          role="alert"
        >
          <AlertTriangle className="h-12 w-12 text-red-500" aria-hidden="true" />
          <h2 className="text-xl font-semibold">오류가 발생했습니다</h2>
          <p className="text-sm text-gray-500">{error.message || "알 수 없는 오류입니다."}</p>
          <Button onClick={reset} variant="outline">
            다시 시도
          </Button>
        </div>
      </body>
    </html>
  );
}
