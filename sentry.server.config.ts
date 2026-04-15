import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // 프로덕션에서만 에러 수집
  enabled: process.env.NODE_ENV === "production",
  // 서버사이드 성능 트레이싱
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
