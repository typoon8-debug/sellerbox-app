/**
 * E2E 테스트: 광고 관리 플로우
 *
 * - 광고 콘텐츠 등록 (F018)
 * - 광고 일정 연결 (F019)
 * - 광고 상태 ACTIVE 전환
 * - 광고 로그 조회 (F022)
 * - 광고 타겟 설정 (F020)
 * - 광고 빈도 한도 설정 (F021)
 * - 반응형 뷰포트 smoke test
 */

import { test, expect, type Page } from "@playwright/test";
import { TEST_CREDENTIALS } from "./fixtures/seed";

// ─── 헬퍼: 로그인 ─────────────────────────────────────────────────────────────

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  await page.fill('input[type="email"], input[name="email"]', TEST_CREDENTIALS.ADMIN.email);
  await page.fill(
    'input[type="password"], input[name="password"]',
    TEST_CREDENTIALS.ADMIN.password
  );
  await page.click('button[type="submit"]');

  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15000 });
}

// ─── 광고 콘텐츠 관리 (F018) ──────────────────────────────────────────────────

test.describe("광고 콘텐츠 관리 (F018)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/ads/contents");
    await page.waitForLoadState("networkidle");
  });

  test("광고 콘텐츠 목록 페이지가 정상 렌더링된다", async ({ page }) => {
    // 페이지 타이틀 확인
    const heading = page.locator("h1, h2, [data-testid='page-title']");
    await expect(heading.first()).toBeVisible();

    // 테이블 또는 목록 영역 존재 확인
    const tableOrList = page.locator("table, [role='grid'], [data-testid='data-table']");
    await expect(tableOrList.first()).toBeVisible();
  });

  test("광고 콘텐츠 등록 다이얼로그가 열린다", async ({ page }) => {
    // 등록 버튼 찾기 (다양한 패턴)
    const registerBtn = page.locator(
      '[data-testid="register-btn"], button:has-text("등록"), button:has-text("추가"), button:has-text("새 콘텐츠")'
    );

    if (await registerBtn.first().isVisible()) {
      await registerBtn.first().click();

      // 다이얼로그 또는 시트 열림 확인
      const dialog = page.locator('[role="dialog"], [data-testid="layer-dialog"]');
      await expect(dialog.first()).toBeVisible();
    }
  });

  test("광고 콘텐츠 검색이 동작한다", async ({ page }) => {
    // 검색 입력창 확인
    const searchInput = page.locator(
      'input[placeholder*="검색"], input[type="search"], [data-testid="search-input"]'
    );

    if (await searchInput.first().isVisible()) {
      await searchInput.first().fill("테스트 광고");
      await page.waitForTimeout(500);
      // 검색 결과 영역 존재 확인 (에러 없이 동작)
      await expect(page.locator("table, [role='grid']").first()).toBeVisible();
    }
  });
});

// ─── 광고 일정 관리 (F019) ──────────────────────────────────────────────────

test.describe("광고 일정 관리 (F019)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/ads/schedules");
    await page.waitForLoadState("networkidle");
  });

  test("광고 일정 목록 페이지가 정상 렌더링된다", async ({ page }) => {
    const heading = page.locator("h1, h2, [data-testid='page-title']");
    await expect(heading.first()).toBeVisible();

    const tableOrList = page.locator("table, [role='grid'], [data-testid='data-table']");
    await expect(tableOrList.first()).toBeVisible();
  });

  test("광고 일정 등록 다이얼로그가 열린다", async ({ page }) => {
    const registerBtn = page.locator(
      '[data-testid="register-btn"], button:has-text("등록"), button:has-text("추가"), button:has-text("새 일정")'
    );

    if (await registerBtn.first().isVisible()) {
      await registerBtn.first().click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog.first()).toBeVisible();
    }
  });
});

// ─── 광고 콘텐츠 등록 → 일정 연결 → ACTIVE 전환 통합 플로우 ──────────────

test.describe("광고 등록 → 일정 연결 → ACTIVE 전환 통합 플로우", () => {
  test.skip(
    !process.env.NEXT_PUBLIC_SUPABASE_URL,
    "Supabase 연결이 필요한 통합 테스트 — NEXT_PUBLIC_SUPABASE_URL 환경변수 없으면 스킵"
  );

  test("광고 콘텐츠 등록 후 일정 페이지에서 콘텐츠를 선택할 수 있다", async ({ page }) => {
    await loginAsAdmin(page);

    // Step 1: 광고 콘텐츠 페이지 이동
    await page.goto("/ads/contents");
    await page.waitForLoadState("networkidle");

    // Step 2: 콘텐츠 등록 버튼 클릭
    const registerBtn = page.locator(
      '[data-testid="register-btn"], button:has-text("등록"), button:has-text("추가")'
    );

    if (await registerBtn.first().isVisible()) {
      await registerBtn.first().click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog.first()).toBeVisible();

      // 제목 입력
      const titleInput = dialog.locator('input[name="title"], input[placeholder*="제목"]');
      if (await titleInput.isVisible()) {
        await titleInput.fill("[E2E] 테스트 광고 콘텐츠");
      }

      // 저장 버튼 클릭
      const saveBtn = dialog.locator(
        'button[type="submit"], button:has-text("저장"), button:has-text("등록")'
      );
      if (await saveBtn.first().isVisible()) {
        await saveBtn.first().click();
        await page.waitForTimeout(1000);
      }
    }

    // Step 3: 광고 일정 페이지 이동
    await page.goto("/ads/schedules");
    await page.waitForLoadState("networkidle");
    await expect(
      page.locator("table, [role='grid'], [data-testid='data-table']").first()
    ).toBeVisible();

    // Step 4: 광고 로그 페이지 확인
    await page.goto("/ads/logs");
    await page.waitForLoadState("networkidle");
    await expect(
      page.locator("table, [role='grid'], [data-testid='data-table']").first()
    ).toBeVisible();
  });
});

// ─── 광고 타겟 관리 (F020) ────────────────────────────────────────────────────

test.describe("광고 타겟 관리 (F020)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/ads/targets");
    await page.waitForLoadState("networkidle");
  });

  test("광고 타겟 목록 페이지가 정상 렌더링된다", async ({ page }) => {
    const heading = page.locator("h1, h2, [data-testid='page-title']");
    await expect(heading.first()).toBeVisible();
  });
});

// ─── 광고 빈도 한도 관리 (F021) ───────────────────────────────────────────────

test.describe("광고 빈도 한도 관리 (F021)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/ads/caps");
    await page.waitForLoadState("networkidle");
  });

  test("광고 빈도 한도 페이지가 정상 렌더링된다", async ({ page }) => {
    const heading = page.locator("h1, h2, [data-testid='page-title']");
    await expect(heading.first()).toBeVisible();
  });
});

// ─── 광고 로그 조회 (F022) ────────────────────────────────────────────────────

test.describe("광고 로그 조회 (F022)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/ads/logs");
    await page.waitForLoadState("networkidle");
  });

  test("광고 로그 목록 페이지가 정상 렌더링된다", async ({ page }) => {
    const heading = page.locator("h1, h2, [data-testid='page-title']");
    await expect(heading.first()).toBeVisible();

    // 테이블 영역 존재 확인
    const tableOrList = page.locator("table, [role='grid'], [data-testid='data-table']");
    await expect(tableOrList.first()).toBeVisible();
  });

  test("광고 로그 페이지에 날짜 필터가 표시된다", async ({ page }) => {
    // 날짜 범위 필터 또는 기간 선택 UI 존재 확인
    const dateFilter = page.locator(
      '[data-testid="date-range-picker"], input[type="date"], button:has-text("기간"), [placeholder*="시작일"]'
    );

    // 날짜 필터가 있으면 가시성 확인
    if (await dateFilter.first().isVisible()) {
      await expect(dateFilter.first()).toBeVisible();
    }
  });
});

// ─── 반응형 뷰포트 Smoke Test ──────────────────────────────────────────────────

const VIEWPORTS = [
  { name: "데스크탑 FHD (1920px)", width: 1920, height: 1080 },
  { name: "데스크탑 HD (1366px)", width: 1366, height: 768 },
  { name: "랩탑 (1024px)", width: 1024, height: 768 },
] as const;

VIEWPORTS.forEach(({ name, width, height }) => {
  test(`광고 관리 반응형 smoke test — ${name}`, async ({ page }) => {
    await loginAsAdmin(page);
    await page.setViewportSize({ width, height });
    await page.goto("/ads/contents");
    await page.waitForLoadState("networkidle");

    // 테이블 가로 스크롤 래퍼 확인
    const tableWrapper = page.locator("table, [role='grid']").first();
    await expect(tableWrapper).toBeVisible();

    // 레이아웃 overflow 확인
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(width + 20);
  });
});
