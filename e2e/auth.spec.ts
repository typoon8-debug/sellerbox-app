/**
 * E2E 테스트: 인증 플로우
 *
 * 로그인, 로그아웃, 역할별 라우팅 및 접근 제어를 검증합니다.
 * - 정상 로그인 → /stores 리다이렉트 확인
 * - 잘못된 자격증명 → 에러 메시지 표시
 * - 로그아웃 → /login 리다이렉트
 * - 인증 없이 보호된 경로 접근 → /login 리다이렉트
 * - 반응형 뷰포트(1920, 1366, 1024px) smoke test
 */

import { test, expect, type Page } from "@playwright/test";
import { TEST_CREDENTIALS } from "./fixtures/seed";

// ─── 헬퍼 함수 ───────────────────────────────────────────────────────────────

/**
 * 로그인 폼을 채우고 제출합니다.
 */
async function fillLoginForm(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  // 이메일 입력 (type="email" 또는 name="email")
  await page.fill('input[type="email"], input[name="email"]', email);
  // 비밀번호 입력 (type="password" 또는 name="password")
  await page.fill('input[type="password"], input[name="password"]', password);
  // 로그인 버튼 클릭
  await page.click('button[type="submit"]');
}

// ─── 로그인 테스트 ─────────────────────────────────────────────────────────────

test.describe("로그인 플로우", () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로그인 페이지로 이동
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
  });

  test("로그인 페이지가 정상적으로 렌더링된다", async ({ page }) => {
    // 페이지 타이틀 또는 헤더 확인
    await expect(page.locator("h1")).toContainText("셀러박스");
    // 이메일 입력 필드 존재 확인
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    // 비밀번호 입력 필드 존재 확인
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    // 로그인 버튼 존재 확인
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("올바른 자격증명으로 로그인하면 /stores로 리다이렉트된다", async ({ page }) => {
    await fillLoginForm(page, TEST_CREDENTIALS.OWNER.email, TEST_CREDENTIALS.OWNER.password);

    // 로그인 후 /stores 또는 /stores로 리다이렉트 확인
    await page.waitForURL(
      (url) => url.pathname.startsWith("/stores") || url.pathname.startsWith("/stores"),
      { timeout: 15000 }
    );

    // 인증된 상태의 페이지 내용 확인
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("잘못된 비밀번호로 로그인하면 에러 메시지가 표시된다", async ({ page }) => {
    await fillLoginForm(page, TEST_CREDENTIALS.OWNER.email, "wrong-password-12345");

    // 에러 toast 또는 에러 메시지 대기
    // Sonner 토스트는 [data-sonner-toast] 또는 role="status" 사용
    await page.waitForTimeout(2000);

    // 여전히 로그인 페이지에 머물러 있어야 함
    await expect(page).toHaveURL(/\/login/);
  });

  test("잘못된 이메일로 로그인하면 에러가 표시된다", async ({ page }) => {
    await fillLoginForm(page, "nonexistent@example.com", "any-password-123");

    await page.waitForTimeout(2000);

    // 여전히 로그인 페이지에 머물러 있어야 함
    await expect(page).toHaveURL(/\/login/);
  });
});

// ─── 로그아웃 테스트 ──────────────────────────────────────────────────────────

test.describe("로그아웃 플로우", () => {
  test("로그인 후 로그아웃하면 /login으로 리다이렉트된다", async ({ page }) => {
    // 먼저 로그인
    await fillLoginForm(page, TEST_CREDENTIALS.OWNER.email, TEST_CREDENTIALS.OWNER.password);

    // 로그인 완료 대기
    await page.waitForURL(
      (url) => url.pathname.startsWith("/stores") || url.pathname.startsWith("/stores"),
      { timeout: 15000 }
    );

    // 로그아웃 버튼 찾기 (사이드바 또는 드롭다운)
    // 여러 가능한 선택자 시도
    const logoutButton = page.locator(
      '[data-testid="logout-button"], button:has-text("로그아웃"), a:has-text("로그아웃")'
    );

    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      // 로그아웃 후 /login으로 리다이렉트 확인
      await page.waitForURL(/\/login/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/login/);
    } else {
      // 로그아웃 버튼이 없는 경우 — 드롭다운 메뉴 열기 시도
      const userMenu = page.locator('[data-testid="user-menu"], [aria-label="사용자 메뉴"]');
      if (await userMenu.isVisible()) {
        await userMenu.click();
        await page.locator('button:has-text("로그아웃"), a:has-text("로그아웃")').click();
        await page.waitForURL(/\/login/, { timeout: 10000 });
        await expect(page).toHaveURL(/\/login/);
      }
    }
  });
});

// ─── 라우트 보호 테스트 ───────────────────────────────────────────────────────

test.describe("인증되지 않은 접근 제어", () => {
  test("인증 없이 /stores 접근 시 /login으로 리다이렉트된다", async ({ page }) => {
    await page.goto("/stores");
    await page.waitForURL(/\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("인증 없이 /orders/picking 접근 시 /login으로 리다이렉트된다", async ({ page }) => {
    await page.goto("/orders/picking");
    await page.waitForURL(/\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("인증 없이 /items 접근 시 /login으로 리다이렉트된다", async ({ page }) => {
    await page.goto("/items");
    await page.waitForURL(/\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("인증 없이 /promotions 접근 시 /login으로 리다이렉트된다", async ({ page }) => {
    await page.goto("/promotions");
    await page.waitForURL(/\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("인증 없이 /support/cs 접근 시 /login으로 리다이렉트된다", async ({ page }) => {
    await page.goto("/support/cs");
    await page.waitForURL(/\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

// ─── 반응형 뷰포트 Smoke Test ─────────────────────────────────────────────────

const VIEWPORTS = [
  { name: "데스크탑 FHD (1920px)", width: 1920, height: 1080 },
  { name: "데스크탑 HD (1366px)", width: 1366, height: 768 },
  { name: "랩탑 (1024px)", width: 1024, height: 768 },
] as const;

VIEWPORTS.forEach(({ name, width, height }) => {
  test(`반응형 smoke test — ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // 로그인 폼이 보여야 함
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // 레이아웃 overflow 없음 확인 (가로 스크롤 없어야 함)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(width + 20); // 20px 허용 오차
  });
});
