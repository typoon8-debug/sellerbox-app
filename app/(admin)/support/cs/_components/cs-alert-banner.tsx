"use client";

interface CsAlertBannerProps {
  openCount: number;
}

export function CsAlertBanner({ openCount }: CsAlertBannerProps) {
  if (openCount <= 0) return null;

  return (
    <div className="rounded-md bg-orange-50 px-4 py-2 text-center text-sm font-semibold text-orange-700 ring-1 ring-orange-200">
      딩동~~ 고객 CS가 접수되었습니다!! {openCount}건의 고객요청을 처리해 주세요!!
    </div>
  );
}
