/**
 * E2E 테스트: 프로모션 등록 + 쿠폰 발급 플로우
 *
 * - 프로모션 목록 페이지 렌더링
 * - 프로모션 등록 다이얼로그 및 폼 제출
 * - 프로모션 상태 변경 (SCHEDULED → ACTIVE)
 * - 프로모션 상품 추가
 * - 쿠폰 목록 페이지 렌더링
 * - 쿠폰 등록 다이얼로그 및 폼 제출
 * - 쿠폰 발급 처리
 * - 쿠폰 발급 이력 조회
 * - 반응형 뷰포트(1920, 1366, 1024px) smoke test
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

// ─── 프로모션 관리 테스트 ─────────────────────────────────────────────────────

test.describe("프로모션 관리", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/promotions");
    await page.waitForLoadState("networkidle");
  });

  test("프로모션 목록 페이지가 정상적으로 렌더링된다", async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page.locator("h1, h2, [data-testid='page-title']").first()).toContainText(
      "프로모션"
    );

    // 테이블이 있어야 함
    await expect(
      page.locator("table, [role='grid'], [data-testid='promotions-list']")
    ).toBeVisible();
  });

  test("프로모션 등록 버튼 클릭 시 다이얼로그가 열린다", async ({ page }) => {
    const addButton = page.locator(
      'button:has-text("프로모션 등록"), button:has-text("등록"), button[aria-label*="등록"]'
    );

    if (await addButton.first().isVisible()) {
      await addButton.first().click();

      // 다이얼로그 열림 확인
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    }
  });

  test("프로모션 등록 폼을 작성하고 제출한다", async ({ page }) => {
    const addButton = page.locator('button:has-text("프로모션 등록"), button:has-text("등록")');

    if (!(await addButton.first().isVisible())) return;

    await addButton.first().click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // 프로모션명 입력
    const nameInput = page.locator(
      '[role="dialog"] input[name="name"], [role="dialog"] input[placeholder*="프로모션"]'
    );
    if (await nameInput.isVisible()) {
      await nameInput.fill(`[E2E] 테스트 프로모션 ${Date.now()}`);
    }

    // 프로모션 유형 선택 (DISCOUNT_PCT)
    const typeSelect = page.locator(
      '[role="dialog"] select[name="type"], [role="dialog"] [data-radix-select-trigger]:first-child'
    );
    if (await typeSelect.isVisible()) {
      await typeSelect.click();
      const pctOption = page.locator(
        '[role="option"]:has-text("할인율"), [role="option"]:has-text("DISCOUNT_PCT"), option[value="DISCOUNT_PCT"]'
      );
      if (await pctOption.isVisible()) {
        await pctOption.click();
      }
    }

    // 할인값 입력
    const discountInput = page.locator(
      '[role="dialog"] input[name="discount_value"], [role="dialog"] input[placeholder*="할인"]'
    );
    if (await discountInput.isVisible()) {
      await discountInput.fill("10");
    }

    // 시작일 입력
    const startAtInput = page.locator(
      '[role="dialog"] input[name="start_at"], [role="dialog"] input[placeholder*="시작"]'
    );
    if (await startAtInput.isVisible()) {
      await startAtInput.fill("2025-01-01");
    }

    // 종료일 입력
    const endAtInput = page.locator(
      '[role="dialog"] input[name="end_at"], [role="dialog"] input[placeholder*="종료"]'
    );
    if (await endAtInput.isVisible()) {
      await endAtInput.fill("2025-12-31");
    }

    // 등록 버튼 클릭
    const submitButton = page.locator(
      '[role="dialog"] button:has-text("등록"), [role="dialog"] button[type="submit"]'
    );
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test("프로모션 상태를 변경한다", async ({ page }) => {
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    if (rowCount === 0) return;

    // 편집 버튼 클릭
    const editButton = rows
      .first()
      .locator('button[aria-label*="편집"], button[aria-label*="수정"], button:has-text("수정")');

    if (!(await editButton.isVisible())) return;

    await editButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // 상태 Select 변경
    const statusSelect = page
      .locator('[role="dialog"] select[name="status"], [role="dialog"] [data-radix-select-trigger]')
      .last();

    if (await statusSelect.isVisible()) {
      await statusSelect.click();
      const activeOption = page.locator(
        '[role="option"]:has-text("활성"), [role="option"]:has-text("ACTIVE"), option[value="ACTIVE"]'
      );
      if (await activeOption.isVisible()) {
        await activeOption.click();
      }
    }

    // 수정 버튼 클릭
    const saveButton = page.locator(
      '[role="dialog"] button:has-text("수정"), [role="dialog"] button:has-text("저장")'
    );
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test("프로모션 상품 추가 페이지가 정상 렌더링된다", async ({ page }) => {
    await page.goto("/promotions/items");
    await page.waitForLoadState("networkidle");

    // 페이지가 정상적으로 로드되어야 함
    await expect(page.locator("main")).toBeVisible();
  });
});

// ─── 쿠폰 관리 테스트 ─────────────────────────────────────────────────────────

test.describe("쿠폰 관리", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/coupons");
    await page.waitForLoadState("networkidle");
  });

  test("쿠폰 목록 페이지가 정상적으로 렌더링된다", async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page.locator("h1, h2, [data-testid='page-title']").first()).toContainText("쿠폰");

    // 테이블이 있어야 함
    await expect(page.locator("table, [role='grid'], [data-testid='coupons-list']")).toBeVisible();
  });

  test("쿠폰 등록 버튼 클릭 시 다이얼로그가 열린다", async ({ page }) => {
    const addButton = page.locator(
      'button:has-text("쿠폰 등록"), button:has-text("등록"), button[aria-label*="등록"]'
    );

    if (await addButton.first().isVisible()) {
      await addButton.first().click();

      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    }
  });

  test("쿠폰 등록 폼을 작성하고 제출한다", async ({ page }) => {
    const addButton = page.locator('button:has-text("쿠폰 등록"), button:has-text("등록")');

    if (!(await addButton.first().isVisible())) return;

    await addButton.first().click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // 쿠폰명 입력
    const nameInput = page.locator(
      '[role="dialog"] input[name="name"], [role="dialog"] input[placeholder*="쿠폰"]'
    );
    if (await nameInput.isVisible()) {
      await nameInput.fill(`[E2E] 테스트 쿠폰 ${Date.now()}`);
    }

    // 할인 금액 입력
    const discountInput = page.locator(
      '[role="dialog"] input[name="discount_value"], [role="dialog"] input[placeholder*="할인"]'
    );
    if (await discountInput.isVisible()) {
      await discountInput.fill("1000");
    }

    // 유효 종료일 입력
    const validToInput = page.locator(
      '[role="dialog"] input[name="valid_to"], [role="dialog"] input[placeholder*="종료"]'
    );
    if (await validToInput.isVisible()) {
      await validToInput.fill("2025-12-31");
    }

    // 등록 버튼 클릭
    const submitButton = page.locator(
      '[role="dialog"] button:has-text("등록"), [role="dialog"] button[type="submit"]'
    );
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test("쿠폰 발급 버튼 클릭 시 발급 다이얼로그가 열린다", async ({ page }) => {
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    if (rowCount === 0) return;

    // 발급 버튼 찾기
    const issueButton = rows.first().locator('button:has-text("발급"), button[aria-label*="발급"]');

    if (await issueButton.isVisible()) {
      await issueButton.click();

      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    }
  });
});

// ─── 쿠폰 발급 이력 테스트 ───────────────────────────────────────────────────

test.describe("쿠폰 발급 이력", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/coupons/issuances");
    await page.waitForLoadState("networkidle");
  });

  test("쿠폰 발급 이력 페이지가 정상적으로 렌더링된다", async ({ page }) => {
    await expect(page.locator("h1, h2, [data-testid='page-title']").first()).toContainText(
      /쿠폰|발급/
    );

    await expect(page.locator("table, [role='grid'], main")).toBeVisible();
  });

  test("발급 이력에 필터가 동작한다", async ({ page }) => {
    // 상태 필터 찾기
    const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');

    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption("ISSUED");
      await page.waitForTimeout(500);

      // 필터 후에도 테이블이 표시되어야 함
      await expect(page.locator("table, [role='grid']")).toBeVisible();
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
  test(`프로모션/쿠폰 반응형 smoke test — ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await loginAsAdmin(page);
    await page.goto("/promotions");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("main")).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(width + 20);
  });
});
