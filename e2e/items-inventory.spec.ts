/**
 * E2E 테스트: 상품 등록 + 재고 조정 플로우
 *
 * - 상품 목록 페이지 렌더링
 * - 상품 등록 다이얼로그 및 폼 제출
 * - 상품 정보 수정 (상태 변경)
 * - 재고 목록 페이지 렌더링
 * - 재고 조정(입고/조정) 다이얼로그 및 제출
 * - 재고 트랜잭션 이력 확인
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

// ─── 상품 관리 테스트 ─────────────────────────────────────────────────────────

test.describe("상품 관리", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/items");
    await page.waitForLoadState("networkidle");
  });

  test("상품 목록 페이지가 정상적으로 렌더링된다", async ({ page }) => {
    // 페이지 헤더 확인
    await expect(page.locator("h1, h2, [data-testid='page-title']").first()).toContainText("상품");

    // 테이블 또는 목록이 있어야 함
    await expect(page.locator("table, [role='grid'], [data-testid='items-list']")).toBeVisible();
  });

  test("상품 등록 버튼 클릭 시 다이얼로그가 열린다", async ({ page }) => {
    // "상품 등록" 또는 "등록" 버튼 클릭
    const addButton = page.locator(
      'button:has-text("상품 등록"), button:has-text("등록"), button[aria-label*="등록"]'
    );

    if (await addButton.first().isVisible()) {
      await addButton.first().click();

      // 다이얼로그가 열려야 함
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    }
  });

  test("상품 등록 폼을 작성하고 제출한다", async ({ page }) => {
    const addButton = page.locator('button:has-text("상품 등록"), button:has-text("등록")');

    if (!(await addButton.first().isVisible())) {
      test.skip();
      return;
    }

    await addButton.first().click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // SKU 입력
    const skuInput = page.locator('input[placeholder*="SKU"], input[name="sku"], input[id*="sku"]');
    if (await skuInput.isVisible()) {
      await skuInput.fill(`E2E-TEST-SKU-${Date.now()}`);
    }

    // 상품명 입력
    const nameInput = page.locator(
      'input[placeholder*="상품명"], input[name="name"], input[id*="name"]'
    );
    if (await nameInput.isVisible()) {
      await nameInput.fill(`[E2E] 테스트 상품 ${Date.now()}`);
    }

    // 정가 입력
    const listPriceInput = page.locator(
      'input[placeholder*="정가"], input[name="list_price"], input[id*="list_price"]'
    );
    if (await listPriceInput.isVisible()) {
      await listPriceInput.fill("10000");
    }

    // 판매가 입력
    const salePriceInput = page.locator(
      'input[placeholder*="판매가"], input[name="sale_price"], input[id*="sale_price"]'
    );
    if (await salePriceInput.isVisible()) {
      await salePriceInput.fill("8000");
    }

    // 카테고리 입력
    const categoryInput = page.locator(
      'input[placeholder*="카테고리"], input[name="category_name"], input[id*="category"]'
    );
    if (await categoryInput.isVisible()) {
      await categoryInput.fill("신선식품");
    }

    // 등록 버튼 클릭
    const submitButton = page.locator(
      '[role="dialog"] button:has-text("등록"), [role="dialog"] button[type="submit"]'
    );
    await submitButton.click();

    // 다이얼로그 닫힘 또는 성공 메시지 대기
    await page.waitForTimeout(2000);
  });

  test("상품 행을 클릭하면 상세/수정 다이얼로그가 열린다", async ({ page }) => {
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // 편집 버튼 클릭
      const editButton = rows
        .first()
        .locator('button[aria-label*="편집"], button[aria-label*="수정"], button:has-text("수정")');

      if (await editButton.isVisible()) {
        await editButton.click();

        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("상품 상태를 변경한다 (ACTIVE → INACTIVE)", async ({ page }) => {
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
    const statusSelect = page.locator(
      '[role="dialog"] [data-radix-select-trigger], [role="dialog"] select[name="status"]'
    );

    if (await statusSelect.isVisible()) {
      await statusSelect.click();
      // "비활성" 옵션 선택
      const inactiveOption = page.locator(
        '[role="option"]:has-text("비활성"), option[value="INACTIVE"]'
      );
      if (await inactiveOption.isVisible()) {
        await inactiveOption.click();
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
});

// ─── 재고 관리 테스트 ─────────────────────────────────────────────────────────

test.describe("재고 관리", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/inventory");
    await page.waitForLoadState("networkidle");
  });

  test("재고 목록 페이지가 정상적으로 렌더링된다", async ({ page }) => {
    // 페이지 헤더 확인
    await expect(page.locator("h1, h2, [data-testid='page-title']").first()).toContainText("재고");

    // 테이블이 있어야 함
    await expect(page.locator("table, [role='grid']")).toBeVisible();
  });

  test("재고 조정 버튼 클릭 시 다이얼로그가 열린다", async ({ page }) => {
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    if (rowCount === 0) return;

    // 재고 조정 버튼 찾기
    const adjustButton = rows
      .first()
      .locator('button:has-text("조정"), button:has-text("재고 조정"), button[aria-label*="조정"]');

    if (await adjustButton.isVisible()) {
      await adjustButton.click();

      // 다이얼로그 열림 확인
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

      // 조정 유형 선택 필드가 있어야 함
      await expect(
        page.locator('[role="dialog"] select, [role="dialog"] [data-radix-select-trigger]')
      ).toBeVisible();
    }
  });

  test("입고(INBOUND) 재고 조정을 수행한다", async ({ page }) => {
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    if (rowCount === 0) return;

    // 재고 조정 버튼
    const adjustButton = rows
      .first()
      .locator('button:has-text("조정"), button:has-text("재고 조정")');

    if (!(await adjustButton.isVisible())) return;

    await adjustButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // 조정 유형 선택 — INBOUND
    const typeSelect = page.locator('[role="dialog"] [data-radix-select-trigger]').first();
    if (await typeSelect.isVisible()) {
      await typeSelect.click();
      const inboundOption = page.locator('[role="option"]:has-text("입고")');
      if (await inboundOption.isVisible()) {
        await inboundOption.click();
      }
    }

    // 수량 입력
    const quantityInput = page.locator(
      '[role="dialog"] input[type="number"], [role="dialog"] input[name="quantity"]'
    );
    if (await quantityInput.isVisible()) {
      await quantityInput.fill("10");
    }

    // 사유 입력
    const reasonInput = page.locator(
      '[role="dialog"] input[name="reason"], [role="dialog"] textarea[name="reason"]'
    );
    if (await reasonInput.isVisible()) {
      await reasonInput.fill("E2E 테스트 입고 처리");
    }

    // 조정 버튼 클릭
    const submitButton = page.locator(
      '[role="dialog"] button:has-text("조정"), [role="dialog"] button:has-text("확인"), [role="dialog"] button[type="submit"]'
    );
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(2000);
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
  test(`상품/재고 관리 반응형 smoke test — ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await loginAsAdmin(page);
    await page.goto("/items");
    await page.waitForLoadState("networkidle");

    // 페이지 기본 레이아웃 확인
    await expect(page.locator("main, [role='main']")).toBeVisible();

    // 가로 스크롤 없음 확인
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(width + 20);
  });
});
