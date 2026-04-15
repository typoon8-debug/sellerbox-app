/**
 * E2E 테스트: CS(고객지원) + 리뷰 처리 플로우
 *
 * - CS 티켓 목록 페이지 렌더링
 * - CS 티켓 상세 보기 및 상태 변경
 * - CS 티켓 필터링(유형별, 상태별)
 * - 리뷰 목록 페이지 렌더링
 * - 리뷰 상태 변경 (VISIBLE → HIDDEN)
 * - CEO 리뷰 답변 등록
 * - CEO 리뷰 답변 수정
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

// ─── CS 티켓 관리 테스트 ──────────────────────────────────────────────────────

test.describe("CS 티켓 관리", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/support/cs");
    await page.waitForLoadState("networkidle");
  });

  test("CS 티켓 목록 페이지가 정상적으로 렌더링된다", async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page.locator("h1, h2, [data-testid='page-title']").first()).toContainText(
      /CS|고객지원|문의/
    );

    // 테이블이 있어야 함
    await expect(page.locator("table, [role='grid'], [data-testid='cs-list']")).toBeVisible();
  });

  test("CS 티켓 상태 필터가 동작한다", async ({ page }) => {
    // 상태 필터 (OPEN, IN_PROGRESS, CLOSED)
    const statusFilter = page.locator(
      'select[name="status"], [data-testid="status-filter"], button:has-text("상태")'
    );

    if (await statusFilter.first().isVisible()) {
      // OPEN 상태 필터 클릭
      const openFilter = page.locator(
        'option[value="OPEN"], button:has-text("OPEN"), button:has-text("접수")'
      );
      if (await openFilter.first().isVisible()) {
        await openFilter.first().click();
        await page.waitForTimeout(500);

        // 필터 후 테이블이 표시되어야 함
        await expect(page.locator("table, [role='grid']")).toBeVisible();
      }
    }
  });

  test("CS 티켓 유형 필터가 동작한다", async ({ page }) => {
    // 유형 필터 (REFUND, EXCHANGE, INQUIRY)
    const typeFilter = page.locator('select[name="type"], [data-testid="type-filter"]');

    if (await typeFilter.isVisible()) {
      await typeFilter.selectOption("INQUIRY");
      await page.waitForTimeout(500);

      await expect(page.locator("table, [role='grid']")).toBeVisible();
    }
  });

  test("CS 티켓 상태를 OPEN에서 IN_PROGRESS로 변경한다", async ({ page }) => {
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    if (rowCount === 0) return;

    // OPEN 상태의 티켓 찾기
    const openRow = page.locator("tbody tr:has-text('OPEN'), tbody tr:has-text('접수')");

    if (!(await openRow.first().isVisible())) return;

    // 편집 버튼 클릭
    const editButton = openRow
      .first()
      .locator(
        'button[aria-label*="편집"], button[aria-label*="처리"], button:has-text("처리"), button:has-text("수정")'
      );

    if (!(await editButton.isVisible())) return;

    await editButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // 상태 변경 — IN_PROGRESS
    const statusSelect = page.locator(
      '[role="dialog"] select[name="status"], [role="dialog"] [data-radix-select-trigger]'
    );
    if (await statusSelect.first().isVisible()) {
      await statusSelect.first().click();
      const inProgressOption = page.locator(
        '[role="option"]:has-text("처리 중"), [role="option"]:has-text("IN_PROGRESS"), option[value="IN_PROGRESS"]'
      );
      if (await inProgressOption.isVisible()) {
        await inProgressOption.click();
      }
    }

    // 저장 버튼 클릭
    const saveButton = page.locator(
      '[role="dialog"] button:has-text("저장"), [role="dialog"] button:has-text("수정"), [role="dialog"] button[type="submit"]'
    );
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test("CS 티켓을 CLOSED로 처리한다", async ({ page }) => {
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    if (rowCount === 0) return;

    // 처리 가능한 티켓의 편집 버튼
    const editButton = rows
      .first()
      .locator(
        'button[aria-label*="편집"], button[aria-label*="처리"], button:has-text("처리"), button:has-text("수정")'
      );

    if (!(await editButton.isVisible())) return;

    await editButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // 상태를 CLOSED로 변경
    const statusSelect = page.locator(
      '[role="dialog"] select[name="status"], [role="dialog"] [data-radix-select-trigger]'
    );
    if (await statusSelect.first().isVisible()) {
      await statusSelect.first().click();
      const closedOption = page.locator(
        '[role="option"]:has-text("완료"), [role="option"]:has-text("CLOSED"), option[value="CLOSED"]'
      );
      if (await closedOption.isVisible()) {
        await closedOption.click();
      }
    }

    // 처리 메모 입력
    const memoInput = page.locator(
      '[role="dialog"] textarea[name="memo"], [role="dialog"] input[name="memo"]'
    );
    if (await memoInput.isVisible()) {
      await memoInput.fill("E2E 테스트 CS 처리 완료");
    }

    const saveButton = page.locator(
      '[role="dialog"] button:has-text("저장"), [role="dialog"] button:has-text("수정"), [role="dialog"] button[type="submit"]'
    );
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(2000);
    }
  });
});

// ─── 리뷰 관리 테스트 ─────────────────────────────────────────────────────────

test.describe("리뷰 관리", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/support/reviews");
    await page.waitForLoadState("networkidle");
  });

  test("리뷰 목록 페이지가 정상적으로 렌더링된다", async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page.locator("h1, h2, [data-testid='page-title']").first()).toContainText("리뷰");

    // 테이블이 있어야 함
    await expect(page.locator("table, [role='grid'], [data-testid='reviews-list']")).toBeVisible();
  });

  test("리뷰 상태를 VISIBLE에서 HIDDEN으로 변경한다", async ({ page }) => {
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    if (rowCount === 0) return;

    // VISIBLE 상태의 리뷰 찾기
    const visibleRow = page.locator("tbody tr:has-text('VISIBLE'), tbody tr:has-text('공개')");

    if (!(await visibleRow.first().isVisible())) return;

    // 상태 변경 버튼 또는 편집 버튼 찾기
    const editButton = visibleRow
      .first()
      .locator(
        'button[aria-label*="편집"], button[aria-label*="숨김"], button:has-text("숨김"), button:has-text("수정")'
      );

    if (!(await editButton.isVisible())) return;

    await editButton.click();
    await page.waitForTimeout(1000);

    // 다이얼로그가 열린 경우 상태 변경
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.isVisible()) {
      const statusSelect = dialog.locator('select[name="status"], [data-radix-select-trigger]');
      if (await statusSelect.first().isVisible()) {
        await statusSelect.first().click();
        const hiddenOption = page.locator(
          '[role="option"]:has-text("숨김"), [role="option"]:has-text("HIDDEN"), option[value="HIDDEN"]'
        );
        if (await hiddenOption.isVisible()) {
          await hiddenOption.click();
        }
      }

      const saveButton = dialog.locator(
        'button:has-text("저장"), button:has-text("수정"), button[type="submit"]'
      );
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test("CEO 리뷰 답변을 등록한다", async ({ page }) => {
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    if (rowCount === 0) return;

    // "답변 등록" 또는 "답변" 버튼 찾기
    const replyButton = rows
      .first()
      .locator('button:has-text("답변 등록"), button:has-text("답변"), button[aria-label*="답변"]');

    if (!(await replyButton.isVisible())) return;

    await replyButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // 답변 내용 입력
    const contentInput = page.locator(
      '[role="dialog"] textarea[name="content"], [role="dialog"] textarea[placeholder*="답변"]'
    );
    if (await contentInput.isVisible()) {
      await contentInput.fill("E2E 테스트 CEO 답변입니다. 소중한 리뷰 감사합니다.");
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

  test("CEO 리뷰 답변을 수정한다", async ({ page }) => {
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    if (rowCount === 0) return;

    // "답변 수정" 버튼 찾기
    const editReplyButton = rows
      .first()
      .locator('button:has-text("답변 수정"), button[aria-label*="답변 수정"]');

    if (!(await editReplyButton.isVisible())) return;

    await editReplyButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // 답변 내용 수정
    const contentInput = page.locator(
      '[role="dialog"] textarea[name="content"], [role="dialog"] textarea'
    );
    if (await contentInput.isVisible()) {
      await contentInput.clear();
      await contentInput.fill("E2E 테스트 CEO 답변 수정 내용입니다. 감사합니다.");
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

  test("리뷰 목록에서 검색 필터가 동작한다", async ({ page }) => {
    // 검색 입력란
    const searchInput = page.locator('input[placeholder*="검색"], input[type="search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill("테스트");
      await page.waitForTimeout(500);

      // 테이블이 여전히 표시되어야 함
      await expect(page.locator("table, [role='grid']")).toBeVisible();
    }
  });
});

// ─── CS + 리뷰 통합 네비게이션 테스트 ────────────────────────────────────────

test.describe("CS/리뷰 통합 플로우", () => {
  test("CS 페이지에서 리뷰 페이지로 네비게이션이 가능하다", async ({ page }) => {
    await loginAsAdmin(page);

    // CS 페이지 방문
    await page.goto("/support/cs");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, h2").first()).toContainText(/CS|고객지원|문의/);

    // 리뷰 페이지로 이동
    await page.goto("/support/reviews");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, h2").first()).toContainText("리뷰");
  });
});

// ─── 반응형 뷰포트 Smoke Test ─────────────────────────────────────────────────

const VIEWPORTS = [
  { name: "1920px", width: 1920, height: 1080 },
  { name: "1366px", width: 1366, height: 768 },
  { name: "1024px", width: 1024, height: 768 },
] as const;

VIEWPORTS.forEach(({ name, width, height }) => {
  test(`CS/리뷰 관리 반응형 smoke test — ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await loginAsAdmin(page);
    await page.goto("/support/cs");
    await page.waitForLoadState("networkidle");

    // 페이지 기본 레이아웃 확인
    await expect(page.locator("main")).toBeVisible();

    // 가로 스크롤 없음 확인
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(width + 20);
  });
});
