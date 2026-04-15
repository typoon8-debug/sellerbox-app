import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // 프로덕션에서만 에러 수집
  enabled: process.env.NODE_ENV === "production",
  // 성능 트레이싱: 10% 샘플링
  tracesSampleRate: 0.1,
  // 세션 리플레이: 에러 발생 시만 녹화
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.01,
  environment: process.env.NODE_ENV,
  integrations: [],
});
