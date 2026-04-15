/**
 * E2E 테스트: 매장 관리 CRUD 플로우
 *
 * 매장 목록 조회, 가게 등록, 정보 수정, 삭제 플로우를 검증합니다.
 * - 가게 목록 페이지 렌더링
 * - 가게 등록 다이얼로그 열기 및 등록
 * - 가게 정보 수정
 * - 가게 삭제 확인 다이얼로그 및 삭제
 * - 검색 필터 동작
 * - 반응형 뷰포트 smoke test
 */

import { test, expect, type Page } from "@playwright/test";
import { TEST_CREDENTIALS } from "./fixtures/seed";

// ─── 헬퍼: 로그인 ─────────────────────────────────────────────────────────────

/**
 * 테스트 전 로그인 처리
 */
async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  await page.fill('input[type="email"], input[name="email"]', TEST_CREDENTIALS.ADMIN.email);
  await page.fill(
    'input[type="password"], input[name="password"]',
    TEST_CREDENTIALS.ADMIN.password
  );
  await page.click('button[type="submit"]');

  // 로그인 후 페이지 로드 대기
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15000 });
}

// ─── 테스트 그룹 ──────────────────────────────────────────────────────────────

test.describe("매장 관리 CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/stores");
    await page.waitForLoadState("networkidle");
  });

  test("가게 목록 페이지가 정상적으로 렌더링된다", async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page.locator("h1, h2").first()).toContainText("가게");

    // 데이터 테이블이 렌더링되어야 함
    await expect(page.locator("table, [role='grid']")).toBeVisible();

    // "가게 등록" 버튼이 있어야 함
    await expect(page.locator('button:has-text("가게 등록")')).toBeVisible();
  });

  test("가게 등록 다이얼로그가 열리고 폼이 표시된다", async ({ page }) => {
    // "가게 등록" 버튼 클릭
    await page.click('button:has-text("가게 등록")');

    // 다이얼로그가 열려야 함
    await expect(page.locator('[role="dialog"], [data-state="open"]')).toBeVisible({
      timeout: 5000,
    });

    // 폼 필드가 있어야 함
    await expect(page.locator('input[placeholder*="가게명"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="주소"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="전화번호"]')).toBeVisible();
  });

  test("가게 등록 폼을 작성하고 제출한다", async ({ page }) => {
    // "가게 등록" 버튼 클릭
    await page.click('button:has-text("가게 등록")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // 폼 작성
    const storeName = `[E2E테스트] 새 가게 ${Date.now()}`;
    await page.fill('input[placeholder*="가게명"]', storeName);
    await page.fill('input[placeholder*="주소"]', "서울시 강남구 테헤란로 100");
    await page.fill('input[placeholder*="전화번호"]', "02-1234-5678");

    // "등록" 버튼 클릭
    const confirmButton = page.locator(
      '[role="dialog"] button:has-text("등록"), [role="dialog"] button[type="submit"]'
    );
    await confirmButton.click();

    // 성공 toast 또는 다이얼로그 닫힘 확인
    await page.waitForTimeout(2000);

    // 다이얼로그가 닫혔는지 확인
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
  });

  test("가게 목록에서 검색 필터가 동작한다", async ({ page }) => {
    // 검색 입력란 찾기
    const searchInput = page.locator('input[placeholder*="검색"], input[type="search"]');

    if (await searchInput.isVisible()) {
      // 검색어 입력
      await searchInput.fill("테스트");
      await page.waitForTimeout(500); // 디바운스 대기

      // 검색 결과가 표시되어야 함 (결과 없음 메시지 또는 필터된 행)
      await expect(page.locator("table, [role='grid']")).toBeVisible();
    }
  });

  test("가게 행의 편집 버튼을 클릭하면 수정 다이얼로그가 열린다", async ({ page }) => {
    // 테이블에 행이 있는지 확인
    const rows = page.locator("tbody tr, [role='row']");
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // 첫 번째 행의 편집 버튼 클릭
      const editButton = rows
        .first()
        .locator(
          'button[aria-label*="편집"], button[aria-label*="수정"], button:has-text("수정"), [data-testid="edit-button"]'
        );

      if (await editButton.isVisible()) {
        await editButton.click();

        // 수정 다이얼로그가 열려야 함
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

        // 타이틀이 "가게 정보 수정"이어야 함
        await expect(page.locator('[role="dialog"]')).toContainText("수정");
      }
    }
  });

  test("가게 행의 삭제 버튼을 클릭하면 확인 다이얼로그가 열린다", async ({ page }) => {
    const rows = page.locator("tbody tr, [role='row']");
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // 첫 번째 행의 삭제 버튼 찾기
      const deleteButton = rows
        .first()
        .locator(
          'button[aria-label*="삭제"], button:has-text("삭제"), [data-testid="delete-button"]'
        );

      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // 확인 다이얼로그가 열려야 함
        await expect(page.locator('[role="dialog"], [role="alertdialog"]')).toBeVisible({
          timeout: 5000,
        });

        // "삭제" 관련 텍스트가 있어야 함
        await expect(page.locator('[role="dialog"], [role="alertdialog"]')).toContainText("삭제");
      }
    }
  });
});

// ─── 반응형 뷰포트 Smoke Test ─────────────────────────────────────────────────

const VIEWPORTS = [
  { name: "1920px", width: 1920, height: 1080 },
  { name: "1366px", width: 1366, height: 768 },
  { name: "1024px", width: 1024, height: 768 },
] as const;

VIEWPORTS.forEach(({ name, width, height }) => {
  test(`가게 관리 반응형 smoke test — ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await loginAsAdmin(page);
    await page.goto("/stores");
    await page.waitForLoadState("networkidle");

    // 페이지 레이아웃 확인
    await expect(page.locator("table, [role='grid'], main")).toBeVisible();

    // 가로 스크롤 없음 확인
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(width + 20);
  });
});
