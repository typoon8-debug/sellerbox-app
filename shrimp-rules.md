# 셀러박스 어드민 개발 규칙 (AI Agent 전용)

## 1. 프로젝트 개요

- **목적**: 온라인 쇼핑몰 입점 가게 운영자 대상 통합 운영 어드민 시스템
- **사용자 역할**: OWNER, MANAGER, PICKER, PACKER
- **스택**: Next.js 15 App Router, Supabase, Tailwind CSS, shadcn/ui (new-york), Zustand, React Hook Form + Zod

---

## 2. 디렉터리 구조 및 역할

```
app/
  (admin)/          # 인증 필요 어드민 화면 (layout.tsx에서 AdminShell 렌더)
  (auth)/           # 로그인/회원가입 등 공개 인증 화면
  _actions/         # Server Actions 폴더 (_utils.ts = 공통 래퍼)
  page.tsx          # 루트 → (admin) 리다이렉트

components/
  ui/               # shadcn/ui 원본 — 직접 수정 금지
  admin/            # 어드민 전용 공통 컴포넌트 (DataTable, FormField 등)
  frame/            # MDI 레이아웃 프레임 (AdminShell, TopBar, LeftPanel 등)
  contents/         # 콘텐츠 영역 공통 컴포넌트 (PageTitleBar, ModuleCard 등)

lib/
  actions/          # 재사용 가능한 Server Action 함수
  config/env.ts     # 환경 변수 타입 안전 접근
  errors.ts         # AppError, ValidationError, NotFoundError 등 에러 클래스
  hooks/            # 공통 커스텀 훅
  navigation/menu-items.ts  # MENU_TREE 정의 (화면 추가 시 반드시 수정)
  repositories/     # BaseRepository 상속 클래스
  schemas/          # Zod 스키마 정의
  stores/           # Zustand 스토어 (mdi, left-panel, session, ui)
  supabase/         # Supabase 클라이언트 (server, client, admin, middleware)
  types/            # 공통 타입 (api.ts, audit.ts 등)
  utils/            # 순수 유틸 함수
```

---

## 3. Supabase 클라이언트 사용 규칙

| 환경 | 파일 | 함수 |
|------|------|------|
| Server Components / Route Handlers | `lib/supabase/server.ts` | `await createClient()` |
| Client Components (`'use client'`) | `lib/supabase/client.ts` | `createClient()` |
| Server Actions (RLS bypass 필요) | `lib/supabase/admin.ts` | `createAdminClient()` |
| Middleware | `lib/supabase/middleware.ts` | `updateSession()` |

- **Server Component에서 Supabase 클라이언트를 전역 변수로 저장하지 말 것** — 함수 내에서 매번 새로 생성
- **Middleware 수정 시** `createServerClient`와 `supabase.auth.getClaims()` 사이에 코드 삽입 금지
- **새 Response 생성 시** 기존 쿠키를 반드시 복사

---

## 4. Server Action 구현 규칙

### 반드시 `withAction()` 래퍼 사용

```typescript
// app/_actions/xxx.ts
import { withAction } from "@/app/_actions/_utils";
import { xxxSchema } from "@/lib/schemas/xxx";

export const createXxx = withAction(
  xxxSchema,
  async (input, ctx) => {
    const adminClient = createAdminClient();
    const repo = new XxxRepository(adminClient);
    return repo.create(input);
  },
  { action: "CREATE", resource: "XXX" } // 감사 로그 자동 기록
);
```

- `withAction()`은 Zod 파싱 → 관리자 인증(`assertAdminSession`) → 핸들러 실행 → 감사 로그를 순서대로 처리
- 직접 `assertAdminSession()`을 호출하는 패턴은 사용하지 말 것
- 반환 타입은 항상 `ApiResponse<T>` (`{ ok: true, data }` | `{ ok: false, error }`)

---

## 5. Repository 구현 규칙

### BaseRepository 상속 필수

```typescript
// lib/repositories/xxx.ts
import { BaseRepository } from "@/lib/repositories/base";
import type { Database } from "@/lib/supabase/database.types";

type TableName = "xxx_table";

export class XxxRepository extends BaseRepository<TableName> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "xxx_table", "xxx_id", "created_at");
  }

  // 검색 오버라이드 (필요 시)
  protected applySearch(query: unknown, search: string) {
    return (query as { ilike: (col: string, val: string) => unknown })
      .ilike("name", `%${search}%`);
  }
}
```

- `findAll`, `findById`, `paginate`, `create`, `update`, `delete` — 기본 제공
- 복잡한 join 쿼리만 Repository 내에서 별도 메서드로 추가
- Repository는 항상 `adminClient` (Service Role)로 생성 — RLS bypass 목적

---

## 6. 컴포넌트 구현 규칙

### 계층별 책임

- `components/ui/` — shadcn 원본, **수정 금지**. 새 컴포넌트는 `npx shadcn@latest add`로 추가
- `components/admin/` — 어드민 업무 공통 컴포넌트. `DataTable`, `FormField`, `ConfirmDialog` 등 기존 컴포넌트 우선 재사용
- `components/frame/` — MDI 레이아웃 전용. 업무 로직 포함 금지
- `components/contents/` — 페이지 콘텐츠 공통. `PageTitleBar`는 모든 업무 페이지 상단에 사용

### 신규 업무 화면 추가 시

1. `app/(admin)/[화면경로]/page.tsx` 생성
2. `lib/navigation/menu-items.ts`의 `MENU_TREE`에 `MenuNode` 추가 (반드시 동시 수정)
3. `screenNumber`는 기존 번호 체계 확인 후 부여 (10000번대: 테넌트, 20000번대: 사용자, ...)

---

## 7. MDI 탭 시스템 규칙

- 최대 탭 수: **10개** (홈 탭 제외)
- `useMdiStore`에서 `openTab({ id, title, href })` 호출로 탭 열기
- `tab.id`는 화면 고유 ID — URL 경로와 일치시킬 것 (예: `"tenants"`, `"users-detail-u001"`)
- `setDirty(id, true)` — 미저장 데이터 있을 때 호출, 탭 닫기 시 사용자 확인 필요
- 홈 탭(`id: "home"`)은 닫기/이동 불가

---

## 8. 상태 관리 규칙

| 스토어 | 파일 | 용도 |
|--------|------|------|
| `useMdiStore` | `lib/stores/mdi-store.ts` | MDI 탭 관리 |
| `useLeftPanelStore` | `lib/stores/left-panel-store.ts` | 좌측 패널 상태 |
| `useSessionStore` | `lib/stores/session-store.ts` | 세션/사용자 정보 |
| `useUiStore` | `lib/stores/ui-store.ts` | 전역 UI 상태 |

- 서버 데이터(목록, 상세)는 Zustand에 저장하지 말 것 — Server Component 또는 fetch 패턴 사용
- 클라이언트 UI 상태(선택, 열림/닫힘)만 Zustand에 저장

---

## 9. 타입 규칙

- **`any` 타입 사용 금지** (예외: `lib/repositories/base.ts` 내부 qb 변수)
- DB 타입: `lib/supabase/database.types.ts`의 `Database` 타입 사용 — 직접 정의 금지
- API 응답: `ApiResponse<T>`, `PaginatedResult<T>` (`lib/types/api.ts`) 사용
- Zod 스키마는 `lib/schemas/` 에 도메인별로 분리 저장

---

## 10. 에러 처리 규칙

```typescript
import { AppError, NotFoundError, ValidationError, ForbiddenError } from "@/lib/errors";
```

- 도메인 에러는 `lib/errors.ts`의 에러 클래스를 throw
- `withAction()` 래퍼가 자동으로 catch → `ApiResponse` 직렬화 처리
- 클라이언트에서 응답 처리: `if (!result.ok) { toast.error(result.error.message); return; }`

---

## 11. 메뉴/화면 추가 체크리스트

새 화면(페이지) 추가 시 **반드시 동시에 수정해야 할 파일**:

- [ ] `app/(admin)/[경로]/page.tsx` — 신규 페이지
- [ ] `lib/navigation/menu-items.ts` — MENU_TREE에 MenuNode 추가
- [ ] `lib/repositories/[도메인].ts` — 신규 Repository (BaseRepository 상속)
- [ ] `lib/schemas/[도메인].ts` — Zod 스키마
- [ ] `app/_actions/[도메인].ts` — Server Action (withAction 래퍼)

---

## 12. 코드 스타일 규칙

- 들여쓰기: **2칸**
- 네이밍: `camelCase` (변수/함수), `PascalCase` (컴포넌트/클래스), `UPPER_SNAKE` (상수)
- 경로 별칭: `@/` = 프로젝트 루트 (상대경로 사용 금지)
- 주석: 한국어
- 커밋 메시지: 한국어 + 이모지 컨벤셔널 커밋
- `'use client'` — 필요한 경우에만 선언 (Server Component 우선)

---

## 13. 금지 사항

- `components/ui/` 파일 직접 수정 — shadcn 업데이트 시 덮어씌워짐
- Server Component에서 Supabase 클라이언트 전역 변수 사용
- `any` 타입 사용 (BaseRepository 내부 제외)
- `withAction()` 없이 Server Action에서 직접 인증 처리
- Middleware의 `createServerClient`와 `getClaims()` 사이에 코드 삽입
- 새 화면 추가 시 `MENU_TREE` 미수정
- `lib/supabase/database.types.ts`의 타입을 수동으로 수정 (CLI 자동 생성 전용)
- `npm run check-all` 통과 없이 커밋
