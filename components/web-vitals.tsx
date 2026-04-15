"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Web Vitals 수집 컴포넌트
 *
 * Core Web Vitals(CLS, FCP, FID, INP, LCP, TTFB)를 수집하여
 * 개발 환경에서는 콘솔에 출력하고, 프로덕션에서는 분석 엔드포인트로 전송합니다.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === "development") {
      // 개발 환경: 콘솔 출력
      console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}`);
      return;
    }

    // 프로덕션: Vercel Analytics 또는 커스텀 엔드포인트로 전송
    // Sentry 성능 트랜잭션으로 보고
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      navigationType: metric.navigationType,
    });

    // beacon API 우선 사용 (페이지 언로드 시에도 전송 보장)
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/vitals", body);
    }
  });

  return null;
}
