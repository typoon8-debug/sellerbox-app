# 온라인쇼핑몰 관리자 시스템 개발 로드맵

> 입점사·가맹점을 테넌트 단위로 통합 관리하는 시스템 관리자 전용 백오피스

---

## 개요

관리자가 단일 백오피스에서 수행하는 5가지 핵심 기능:

| 기능 ID | 기능명 | 설명 |
|---------|--------|------|
| F001 | 테넌트 관리 | 입점사·가맹점 등록/수정/삭제/조회 |
| F002 | 사용자 관리 | 테넌트별 사용자 계정 CRUD + Supabase Auth 연동 |
| F003 | 공통코드 관리 | 마스터 코드 + 코드값 2단계 CRUD |
| F004 | 광고 관리 | 테넌트별 광고 소재 등록/수정/삭제 + 이미지 업로드 |
| F010 | 관리자 인증 | 이메일/비밀번호 로그인, 세션 관리, 라우트 보호 |
| F011 | 이미지 업로드 | Supabase Storage 기반 광고 이미지 업로드/삭제 |

---

## 개발 워크플로우

```
Phase 1: 골격 구축    →    Phase 2: UI 완성    →    Phase 3: 기능 구현    →    Phase 4: 최적화
(라우트·타입·미들웨어)      (공통 컴포넌트 → 더미 UI)    (공통 API → 개별 기능)       (성능·배포)
```

---

## 설계 원칙

1. **구조 우선**: 골격(라우팅·타입) → 공통(컴포넌트·API) → 기능(개별 CRUD) 순으로 구현
2. **공통 기반 선행**: DataTable / 모달 / 폼 / 이미지업로더 / Generic Repository를 먼저 완성한 뒤 개별 기능에서 재사용
3. **재사용성**: 5개 CRUD 페이지가 동일한 컴포넌트·API 패턴을 공유하여 일관성 보장
4. **일관성**: 네이밍·에러 처리·폼 검증 방식을 전 프로젝트에 걸쳐 표준화
5. **멀티테넌트**: `tenant_id` 기반 데이터 분리, RLS(Row Level Security)로 테넌트 간 데이터 격리
6. **검증 우선**: API 연동·비즈니스 로직을 구현한 직후 **반드시 Playwright MCP로 테스트 수행**, 테스트 통과 전에는 Task를 완료(✅) 표시하지 않음

---

## 테스트 전략 (ROADMAP 전반 적용)

### 도구
**Playwright MCP** (`mcp__playwright__browser_*`) — 실제 브라우저에서 관리자 플로우를 직접 실행하여 검증

### 작성 시점
각 Task의 구현 단계 완료 직후, 해당 Task의 `## 테스트 체크리스트` 시나리오를 전부 수행

### 5종 커버리지 (모든 API·로직 Task 공통)

| 종류 | 설명 |
|------|------|
| **정상 시나리오** | 가장 일반적인 사용자 플로우가 끝까지 성공 |
| **예외 시나리오** | 입력 검증 실패·네트워크 오류·DB 제약 위반 시 토스트/에러 표시 |
| **권한 시나리오** | 비인증 사용자 차단, 타 테넌트 리소스 접근 차단 |
| **엣지 케이스** | 경계값(빈 값·최대 길이·특수문자), 대용량 이미지, 페이지네이션 경계 |
| **회귀 확인** | 다른 페이지/기능 정상 동작 여부 (사이드바 이동, 다크모드 토글) |

### Definition of Done (DoD) — Phase 3 Task 완료 기준

- [ ] 기능 구현 완료
- [ ] Zod 스키마로 입력 검증
- [ ] Playwright MCP로 5종 커버리지 시나리오 모두 통과
- [ ] 콘솔 에러·경고 0건 확인 (`browser_console_messages`)
- [ ] 네트워크 요청 실패 0건 확인 (`browser_network_requests`)
- [ ] 스크린샷 캡처 후 작업 기록에 첨부

### 실패 시 대응
테스트 실패 → 원인 분석 → 구현 수정 → 재실행. 임시 회피책으로 테스트 건너뛰기 금지.

---

## Phase 1: 애플리케이션 골격 구축 ✅

> 라우트·타입·미들웨어만 다루며 화면 구현은 포함하지 않음

### Task 001: 프로젝트 구조 및 라우팅 설정 `[우선순위]` ✅

**목표**: 신규 관리자 시스템 라우트 뼈대를 구성하고 Gather 전용 코드를 일괄 제거

**구현 항목**
- Next.js App Router 라우트 그룹 설계
  - `app/(auth)/login/` — 관리자 로그인
  - `app/(admin)/layout.tsx` — 사이드바+헤더 포함 관리자 레이아웃
  - `app/(admin)/tenants/` — 테넌트 관리 (기본 랜딩)
  - `app/(admin)/users/` — 사용자 관리
  - `app/(admin)/codes/` — 공통코드 관리
  - `app/(admin)/ads/` — 광고 관리
- 각 페이지에 빈 껍데기 컴포넌트 생성 (하드코딩 텍스트만 포함)
- `middleware.ts` 업데이트 — `(admin)` 영역 인증 보호, 미인증 시 `/login` 리디렉션
- 기존 Gather 라우트 일괄 제거
  - `app/(mobile)/*`, `app/admin/*`, `app/auth/*`, `app/protected/*`
- 환경변수 검증 유틸 (`lib/config/env.ts`)

**제거 대상 파일 목록**
- `lib/data/{events,participants,users,admin}.ts`
- `lib/queries/{events,admin,profile}.ts`
- `lib/schemas/{event,profile}.ts`
- `lib/types/{admin,models,forms,components}.ts`
- `lib/utils/{invite-code,username}.ts`
- `lib/auth/oauth.ts`
- `components/events/*`, `components/participants/*`, `components/tutorial/*`
- `components/admin/*` (Gather 차트·로그인 폼 전용)
- `components/{login-form,sign-up-form,forgot-password-form,update-password-form,setup-profile-form,profile-edit-form,social-login-buttons,auth-button,hero,next-logo,deploy-button,supabase-logo,env-var-warning}.tsx`

---

### Task 002: 타입 정의 및 인터페이스 설계 ✅

**목표**: 전 프로젝트에서 공유하는 TypeScript 타입과 Zod 스키마를 먼저 확립

**구현 항목**
- Supabase CLI로 `lib/supabase/database.types.ts` 재생성 (MVP 5개 + 보조 테이블)
- 도메인 타입 정의
  - `lib/types/tenant.ts` — Tenant, TenantType, TenantStatus
  - `lib/types/user.ts` — User, UserRole
  - `lib/types/common-code.ts` — CommonCode, CommonCodeValue
  - `lib/types/ad-placement.ts` — AdPlacement, AdPosition
  - `lib/types/api.ts` — `ApiResponse<T>`, `PaginatedResult<T>`, `ApiError`, `PaginationParams`
- 공통 enum 정의 (`lib/types/enums.ts`)
  - 테넌트 유형, 사용자 역할, 광고 위치 등
- Zod 스키마 정의
  - `lib/schemas/auth.ts` — 로그인 폼
  - `lib/schemas/tenant.ts` — 테넌트 등록/수정
  - `lib/schemas/user.ts` — 사용자 등록/수정
  - `lib/schemas/common-code.ts` — 코드 마스터·코드값
  - `lib/schemas/ad-placement.ts` — 광고 등록/수정

---

## Phase 2: UI/UX 완성 (공통 컴포넌트 우선 + 더미 데이터) ✅

> 실제 API 연결 없이 더미 데이터로 화면을 완성. 공통 컴포넌트를 먼저 완성한 뒤 개별 페이지에서 재사용.

### Task 003: 공통 컴포넌트 라이브러리 구현 `[우선순위]` ✅

**목표**: 5개 CRUD 페이지가 공유하는 재사용 UI 컴포넌트를 선행 구현

**shadcn/ui 추가 설치** (누락 컴포넌트)
```bash
npx shadcn@latest add switch tabs tooltip pagination
```

**구현 컴포넌트**

| 컴포넌트 | 경로 | 설명 |
|----------|------|------|
| DataTable | `components/admin/data-table.tsx` | 검색·정렬·페이지네이션·행 액션·빈 상태 통합 |
| ResourceDialog | `components/admin/resource-dialog.tsx` | 등록/수정/삭제 확인 통합 모달 |
| FormField | `components/admin/form-field.tsx` | React Hook Form + Zod 에러 표시 래퍼 |
| ImageUploader | `components/admin/image-uploader.tsx` | Supabase Storage 업로드 UI (로직은 Phase 3에서 연결) |
| TenantSelector | `components/admin/tenant-selector.tsx` | 사용자·광고 페이지 공유 드롭다운 |
| StatusBadge | `components/admin/status-badge.tsx` | 상태 뱃지 (활성/비활성/대기) |
| ConfirmDialog | `components/admin/confirm-dialog.tsx` | 삭제 확인 전용 다이얼로그 |

**각 컴포넌트 Props 인터페이스**
- `DataTable<T>`: `columns`, `data`, `searchPlaceholder`, `onAdd`, `onEdit`, `onDelete`, `pagination`
- `ResourceDialog`: `mode` (`create` | `edit` | `delete`), `title`, `children`, `onConfirm`, `open`, `onOpenChange`
- `FormField`: `name`, `label`, `required`, `error`, `children`
- `ImageUploader`: `value`, `onChange`, `accept`, `maxSizeMB`, `preview`
- `TenantSelector`: `value`, `onChange`, `placeholder`

---

### Task 004: 관리자 레이아웃 및 네비게이션 ✅

**목표**: 사이드바·헤더 포함 관리자 레이아웃 완성 (더미 사용자 정보 사용)

**구현 항목**
- `components/navigation/admin-sidebar.tsx` — 5개 메뉴 + Lucide 아이콘 + 활성 표시
  - 테넌트 관리 (`Building2`)
  - 사용자 관리 (`Users`)
  - 공통코드 관리 (`Code2`)
  - 광고 관리 (`Megaphone`)
  - 설정 (`Settings`)
- `components/navigation/admin-header.tsx`
  - 현재 사용자 이메일 표시
  - 다크모드 토글 (`ThemeSwitcher`)
  - 로그아웃 버튼
- `app/(admin)/layout.tsx` 완성 — 사이드바 + 헤더 + 메인 콘텐츠 영역
- 반응형 레이아웃 — 모바일에서 햄버거 메뉴 + Sheet 드로어
- 브레드크럼 영역 (`components/navigation/breadcrumb.tsx`)

---

### Task 005: 모든 페이지 UI 구현 (더미 데이터) ✅

**목표**: 실제 API 없이 더미 데이터로 모든 페이지의 화면을 완성하여 사용자 플로우 검증

**더미 데이터 파일**
- `lib/dummy-data/tenants.ts`
- `lib/dummy-data/users.ts`
- `lib/dummy-data/common-codes.ts`
- `lib/dummy-data/ad-placements.ts`

**구현 페이지**

| 페이지 | 경로 | 주요 컴포넌트 |
|--------|------|---------------|
| 관리자 로그인 | `app/(auth)/login/page.tsx` | 이메일/비밀번호 폼 + 에러 표시 |
| 테넌트 관리 | `app/(admin)/tenants/page.tsx` | DataTable + ResourceDialog |
| 사용자 관리 | `app/(admin)/users/page.tsx` | TenantSelector + DataTable + ResourceDialog |
| 공통코드 관리 | `app/(admin)/codes/page.tsx` | 마스터 패널 + 상세 DataTable + ResourceDialog |
| 광고 관리 | `app/(admin)/ads/page.tsx` | TenantSelector + DataTable + ImageUploader + Switch |

**검증 기준**
- 사용자 플로우(로그인 → 각 메뉴 → CRUD 모달) 수동 검증
- 반응형 레이아웃 모바일/데스크톱 확인
- 다크모드 전환 시 스타일 정상 확인

---

## Phase 2.5: UI/UX 세부표준 적용 & 공통 컴포넌트 리팩토링 ✅

> GUI 디자인가이드(슬라이드 2~46) 기반 엔터프라이즈 블루 시스템 전면 적용 및 공통 컴포넌트 확립

### 완료 항목

- [x] **디자인 토큰 전면 교체** (`app/globals.css`) — oklch amber → HEX 가이드 팔레트 (#2E85FF 시스템)
- [x] **폰트 교체** (`app/layout.tsx`) — Geist Sans → Noto Sans KR
- [x] **shadcn 기본 컴포넌트 표준화** (`components/ui/`)
  - button.tsx — variants 재작성 (primary/outline-blue/outline-gray/popup)
  - input.tsx — h-32, border-neutral-line, hover/required/disabled 상태
  - select.tsx — 드롭다운 max-h-178, shadow-popup, scrollbar 가이드
  - dialog.tsx — DialogHeaderBar(bg #E5EDF4), DialogBody, gap-0
  - alert-dialog.tsx — pill 버튼 기본값 (size="popup")
  - table.tsx — row hover/selected 토큰화
  - checkbox.tsx, radio-group.tsx — 18×18 가이드 규격
  - calendar.tsx — §9 데이트피커 규격
  - sonner.tsx — §12 토스트 규격 (bottom-right, w-400, outline #2E85FF)
  - tooltip.tsx, popover.tsx — 토큰 교체
- [x] **프레임 컴포넌트 토큰 교체** (`components/frame/`)
  - top-bar, left-panel, main-menu-bar, sub-menu-tree, mdi-tab-bar
  - tab-menu-list, screen-split-toggle, tenant-context-selector
  - session-countdown, user-profile-menu
- [x] **Contents 컴포넌트 표준화** (`components/contents/`)
  - ModuleCard — amber-50 제거, 가이드 토큰 적용
  - FloatingActionBar — h-80, bg-panel, border-separator
  - NoticeSection — info/warning/danger variant 시스템
  - PageTitleBar — 즐겨찾기 text-yellow-400 → text-primary
- [x] **공통 컴포넌트 신설** (`components/admin/`)
  - QueryField, QueryActions — 조회 모듈 표준 필드/버튼
  - PaginationBar — §6 32px 정사각 버튼, First/Prev/Next/Last
  - SortableTableHead — §6 정렬 아이콘 16×16
  - TableToolbar — 검색+액션+건수 표준 툴바
  - SelectableList — 마스터-디테일 좌측 목록 패턴
  - PasswordInput — 눈 토글 비밀번호 입력
  - KoreanDatePicker — §9 캘린더 팝오버
  - LoadingPopup — §12 312×204 고정 로딩
- [x] **프레임 신규 컴포넌트** (`components/frame/system-logo.tsx`)
- [x] **Zustand ui-store** (`lib/stores/ui-store.ts`) — 전역 로딩 팝업 제어
- [x] **5개 페이지 공통 컴포넌트 치환**
  - login — PasswordInput, variant="primary", 가이드 토큰
  - tenants, users, ads — QueryField + QueryActions 치환
  - codes — 마스터 목록 hover/selected 가이드 토큰
  - 전체 FloatingActionBar 버튼 variant="outline-gray"
  - LayerDialog — DialogHeaderBar + pill footer
  - ConfirmDialog — AlertDialogAction variant prop
- [x] `npm run check-all` 통과 (typecheck + lint + format)
- [x] `npm run build` 통과

---

## Phase 3: 핵심 기능 구현 (공통 API 레이어 선행) ✅

> 공통 API 레이어를 먼저 구축한 뒤, 각 기능을 공통 기반 위에서 구현. **모든 Task는 DoD를 충족해야 완료.**

### Task 006: 공통 API 레이어 구축 `[우선순위]`

**목표**: 5개 CRUD 기능이 공유하는 Generic Repository + Server Actions 패턴 확립

**구현 항목**
- Supabase 클라이언트 3종 타입 바인딩 재확인 (server / client / middleware)
- **Generic Repository** (`lib/repositories/base.ts`)
  ```typescript
  interface BaseRepository<T, CreateDto, UpdateDto> {
    findAll(params?: QueryParams): Promise<T[]>
    findById(id: string): Promise<T | null>
    create(dto: CreateDto): Promise<T>
    update(id: string, dto: UpdateDto): Promise<T>
    delete(id: string): Promise<void>
    paginate(params: PaginationParams): Promise<PaginatedResult<T>>
  }
  ```
- 리소스별 리포지토리 (Generic Repository 상속)
  - `lib/repositories/tenant.ts`
  - `lib/repositories/user.ts`
  - `lib/repositories/common-code.ts`
  - `lib/repositories/common-code-value.ts`
  - `lib/repositories/ad-placement.ts`
- **Server Actions 래퍼** (`app/_actions/`)
  - `auth.ts` — 로그인·로그아웃
  - `tenant.ts` — 테넌트 CRUD
  - `user.ts` — 사용자 CRUD
  - `common-code.ts` — 코드 마스터·코드값 CRUD
  - `ad-placement.ts` — 광고 CRUD + 활성화 토글
- **공통 에러 처리** (`lib/errors.ts`)
  - `AppError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`
  - sonner 토스트 연동 유틸
- RLS(Row Level Security) 정책 초안 — 관리자 role만 접근 허용

---

## 테스트 체크리스트 — Task 006 (Playwright MCP)

**사전 준비**: `/debug` 페이지 임시 생성하여 각 리포지토리 메서드를 직접 호출 가능하도록 구성

### 정상 시나리오
- `browser_navigate("/debug")` → 각 리포지토리의 `findAll` 호출 → 결과 목록 표시 확인 (`browser_snapshot`)
- `create` → `findById` → `update` → `delete` 순서로 단일 레코드 생명주기 검증
- `paginate` 호출 시 `totalCount`, `data`, `hasNextPage` 포함 응답 확인

### 예외 시나리오
- Zod 검증 실패 (필수 필드 누락) → Server Action이 `ValidationError` 반환 → sonner 에러 토스트 노출
- 잘못된 타입 (숫자 필드에 문자열) → 검증 에러
- DB 제약 위반 (중복 키) → `AppError` 반환 → 에러 토스트

### 권한 시나리오
- 미인증 상태에서 Server Action 직접 호출 → `UnauthorizedError` (401) 반환
- 로그인 후 정상 호출 성공 확인

### 엣지 케이스
- 존재하지 않는 ID로 `findById` → `null` 반환 (에러 아님)
- 빈 테이블에서 `findAll` → `[]` 반환
- `paginate` 마지막 페이지 경계 — `hasNextPage: false` 확인

### 회귀 확인
- 공통 에러 핸들러가 sonner `Toaster` 및 기존 UI와 충돌 없이 동작
- `browser_console_messages`로 콘솔 에러 0건
- `browser_network_requests`로 4xx/5xx 0건

---

### Task 007: 관리자 인증 시스템 구현 (F010)

**목표**: 이메일/비밀번호 로그인·세션 관리·라우트 보호 완성

**구현 항목**
- 로그인 Server Action (`app/_actions/auth.ts`) — Supabase Auth 이메일/비밀번호
- `middleware.ts` — `(admin)` 라우트에서 관리자 role 확인 후 보호
- 로그아웃 Server Action
- 세션 만료 감지 → 로그인 리디렉션
- 로그인 페이지 — React Hook Form + Zod 연결 + 에러 표시

---

## 테스트 체크리스트 — Task 007 (Playwright MCP)

### 정상 시나리오
- `browser_navigate("/login")` → 이메일/비밀번호 입력 (`browser_fill_form`) → 로그인 버튼 클릭 (`browser_click`) → `/tenants` 리디렉션 확인 (`browser_snapshot`)
- 로그인 상태에서 사이드바 "로그아웃" 클릭 → `/login` 복귀 확인
- 로그인 후 브라우저 새로고침 → 세션 유지 및 현재 페이지 복원

### 예외 시나리오
- 잘못된 비밀번호 입력 → 에러 토스트 노출 + 여전히 `/login`에 머무는지 확인
- 빈 이메일·빈 비밀번호 제출 → Zod 검증 에러 필드별 표시 (`browser_snapshot`)
- 잘못된 이메일 형식 → Zod 에러 메시지 노출

### 권한 시나리오
- 비인증 상태에서 `browser_navigate("/tenants")` → `/login` 강제 리디렉션 확인
- 비관리자 role 계정 로그인 시도 → `(admin)` 영역 차단 확인 (403 또는 `/login` 리디렉션)
- 세션 쿠키 삭제 (`browser_evaluate`로 쿠키 조작) 후 재요청 → 리디렉션 확인

### 엣지 케이스
- 이메일 255자 초과 입력 → Zod 검증 에러
- 특수문자 포함 비밀번호 → 정상 로그인 처리
- 5회 연속 로그인 실패 → Supabase rate limit 응답 → 사용자 친화적 메시지

### 회귀 확인
- 로그인 후 다크모드 토글 → 세션 유지 확인
- `browser_console_messages`로 콘솔 에러 0건
- `browser_network_requests`로 401/500 에러 0건
- `browser_take_screenshot` — 로그인 전/로그인 직후/리디렉션 후 화면 캡처

---

### Task 008: 테넌트 관리 기능 구현 (F001)

**목표**: 테넌트 CRUD를 실제 DB에 연결, 더미 데이터 제거

**구현 항목**
- tenant 리포지토리 연결 + 더미 데이터 제거
- 등록/수정/삭제 Server Action 연결
- 낙관적 UI 업데이트 (등록·삭제 시 즉시 반영)
- 검색·필터 서버 측 처리 (ILIKE 쿼리)
- 페이지네이션 서버 사이드 처리

---

## 테스트 체크리스트 — Task 008 (Playwright MCP)

### 정상 시나리오
- 테넌트 등록 모달 열기 (`browser_click`) → 폼 입력 (`browser_fill_form`) → 저장 → 목록 즉시 반영 확인 (`browser_snapshot`)
- 기존 테넌트 행의 "수정" 클릭 → 값 변경 → 저장 → 테이블 값 갱신 확인
- 삭제 확인 다이얼로그 → 확정 클릭 → 행 제거 확인
- 검색창에 테넌트 이름 일부 입력 → 필터 결과 노출 (`browser_snapshot`)

### 예외 시나리오
- 필수 필드(이름·유형) 미입력 저장 → 폼 에러 표시, 모달 유지 확인
- 중복 이름 등록 → DB unique 제약 위반 → 에러 토스트 노출
- Server Action 실패 시뮬레이션 (`browser_evaluate`로 fetch 가로채기) → 에러 토스트 노출

### 권한 시나리오
- 로그아웃 후 `/tenants` 접근 → `/login` 리디렉션 확인
- 비관리자 세션으로 접근 차단 확인

### 엣지 케이스
- 테넌트 이름 최대 길이(255자) 입력 → 정상 저장
- 특수문자(`'`, `"`, `<script>`) 포함 이름 → XSS 이스케이프 처리 확인 (`browser_snapshot`)
- 100건+ 데이터 페이지네이션 경계 이동 (1→2→마지막 페이지)
- 검색 결과 0건 → EmptyState 컴포넌트 노출 확인

### 회귀 확인
- 테넌트 등록 후 사이드바 "사용자 관리" 이동 시 TenantSelector에 신규 테넌트 표시 확인
- 다크모드 토글 후 DataTable 스타일 정상 확인
- `browser_console_messages`로 콘솔 에러 0건
- `browser_network_requests`로 4xx/5xx 0건
- 등록·수정·삭제 각각 `browser_take_screenshot` 캡처

---

### Task 009: 사용자 관리 기능 구현 (F002) ✅

**목표**: 테넌트별 사용자 CRUD + Supabase Auth 계정 생성 연동

**구현 항목**
- ✅ user 리포지토리 연결 (tenant_id 필수 조건)
- ✅ TenantSelector 변경 시 사용자 목록 재조회
- ✅ 사용자 등록 시 Supabase Auth `admin.createUser` API 연동
- ✅ 사용자 삭제 시 Supabase Auth 계정 동시 제거
- ✅ 역할(role) 변경 기능

---

## 테스트 체크리스트 — Task 009 (Playwright MCP)

### 정상 시나리오
- TenantSelector에서 테넌트 선택 → 해당 테넌트 사용자 목록 로드 확인 (`browser_snapshot`)
- 사용자 등록 폼 작성 → 저장 → Auth 계정 생성 + DB 레코드 추가 확인
- 사용자 수정 모달에서 역할 변경 (`browser_select_option`) → 저장 → 테이블 갱신 확인
- 사용자 삭제 → Auth 계정 제거 + 테이블에서 사라짐 확인

### 예외 시나리오
- 이미 존재하는 이메일로 등록 시도 → Supabase Auth 중복 에러 → 에러 토스트
- 약한 비밀번호(6자 미만) 입력 → Zod 검증 또는 Auth 정책 에러 메시지
- Auth 실패 후 DB 레코드 롤백 확인 (부분 생성 상태 금지)

### 권한 시나리오
- 테넌트 A 세션에서 테넌트 B 사용자 URL 직접 접근 → 차단 확인
- 미인증 접근 → `/login` 리디렉션

### 엣지 케이스
- TenantSelector 전환 시 이전 테넌트 목록이 남지 않는지 (상태 초기화) 확인
- 사용자 0명인 테넌트 선택 → EmptyState 노출
- 이메일 `+` alias(`user+test@example.com`) → 정상 처리
- 유니코드 이름 (한글·이모지) 입력 → 정상 저장

### 회귀 확인
- 사용자 등록 후 해당 계정으로 별도 로그인 시도 → 성공 확인
- 테넌트 관리 페이지로 이동 시 기존 기능 정상
- `browser_console_messages`로 콘솔 에러 0건
- `browser_network_requests`로 4xx/5xx 0건
- 등록·수정·삭제 각각 `browser_take_screenshot` 캡처

---

### Task 010: 공통코드 관리 기능 구현 (F003) ✅

**목표**: 코드 마스터 + 코드값 2단계 CRUD 완성

**구현 항목**
- ✅ `common_code` 리포지토리 + `common_code_value` 리포지토리 연결
- ✅ 마스터 선택 시 상세 코드값 목록 조회
- ✅ 코드값 `sort_order` 편집 (숫자 입력 방식)
- ✅ 마스터 코드 삭제 시 cascade (하위 코드값 자동 삭제)
- ✅ 코드 마스터 수정 기능 추가
- ✅ 코드값 수정 기능 추가
- ✅ 메뉴 통합: "코드 마스터" + "코드값 관리" → "공통코드 관리" 단일 메뉴

---

## 테스트 체크리스트 — Task 010 (Playwright MCP)

### 정상 시나리오
- 코드 마스터 등록 → 좌측 패널에 즉시 노출 (`browser_snapshot`)
- 마스터 선택 (`browser_click`) → 우측 코드값 테이블이 해당 마스터 값으로 로드
- 코드값 등록/수정/삭제 → 테이블 즉시 반영
- `sort_order` 변경 → 저장 → 목록 순서 변경 확인

### 예외 시나리오
- 마스터 `code` 중복 등록 → unique 제약 위반 → 에러 토스트
- 코드값 `value` 중복 (같은 마스터 내) → 에러 토스트
- `sort_order`에 음수·문자 입력 → Zod 검증 에러 메시지

### 권한 시나리오
- 미인증 상태에서 `/codes` 접근 → `/login` 리디렉션 확인

### 엣지 케이스
- 마스터 삭제 시 하위 코드값 cascade 동작(또는 삭제 금지 에러) 확인 — 정책에 따라 케이스 분기
- 코드값 0개인 마스터 선택 → 우측 EmptyState 노출
- 코드값 100개+ 정렬 성능 체감 확인
- 다른 마스터로 전환 시 우측 패널 상태 초기화 확인 (`browser_snapshot`)

### 회귀 확인
- 공통코드 값 변경 후 사용자 관리 페이지의 역할 드롭다운이 정상 작동하는지 확인
- `browser_console_messages`로 콘솔 에러 0건
- `browser_network_requests`로 4xx/5xx 0건
- 마스터 등록·코드값 등록·삭제 각각 `browser_take_screenshot` 캡처

---

### Task 011: 광고 관리 기능 구현 (F004, F011) ✅

**목표**: 테넌트별 광고 CRUD + Supabase Storage 이미지 업로드 완성

**구현 항목**
- ✅ `fp_ad_placement` 리포지토리 연결 (findPagedByTenant: position·isActive 필터)
- ✅ Supabase Storage 버킷 생성 (`ad-images`, public, 5MB)
- ✅ 광고 등록/수정 시 data URL → Storage 업로드 → URL 저장
- ✅ 활성화 토글 Server Action
- ✅ 광고 수정 시 기존 이미지 교체 (Storage 이전 객체 삭제)
- ✅ 광고 삭제 시 Storage 객체 동기 삭제 (best-effort)
- ✅ 광고 수정 다이얼로그 추가
- ✅ 메뉴명 변경: "광고 소재 조회" → "광고관리"
- ✅ 광고 이미지 사이즈 검증 (타입1: 375×160px, 타입2: 345×70px)

---

## 테스트 체크리스트 — Task 011 (Playwright MCP)

### 정상 시나리오
- 테넌트 선택 → 광고 등록 모달 → 위치 선택 (`browser_select_option`) → 이미지 파일 업로드 (`browser_file_upload`) → 미리보기 확인 (`browser_snapshot`) → 저장 → 테이블에 썸네일 표시
- 활성화 토글 스위치 클릭 (`browser_click`) → 상태 즉시 반영 → 새로고침 후 상태 유지 확인
- 광고 수정: 기존 이미지 교체 업로드 → 저장 → 썸네일 갱신, Storage 이전 객체 제거 확인
- 광고 삭제 확인 다이얼로그 → 삭제 → 테이블·Storage 동시 제거 확인

### 예외 시나리오
- 이미지 없이 저장 시도 → 검증 에러 토스트
- 허용 외 포맷(`.txt`, `.pdf`) 업로드 시도 → 포맷 제한 에러 메시지
- 10MB 초과 이미지 업로드 시도 → 크기 제한 에러 메시지
- Storage 업로드 실패 시뮬레이션 (`browser_evaluate`) → DB 레코드 생성 롤백 확인

### 권한 시나리오
- 타 테넌트 광고 직접 URL 접근 → 차단 확인
- 미인증 상태에서 `/ads` 접근 → `/login` 리디렉션

### 엣지 케이스
- PNG / JPG / WebP 각각 업로드 성공 확인 (`browser_take_screenshot`)
- 긴 파일명(한글 포함) → 안전한 파일명으로 정규화 확인
- 동일 광고 위치에 여러 광고 등록 허용 여부(정책) 확인
- 광고 0개 테넌트 선택 → EmptyState 노출

### 회귀 확인
- 사이드바 다른 메뉴로 이동 후 돌아와도 TenantSelector 상태 유지
- 다크모드에서 이미지 미리보기 정상 렌더링 확인
- `browser_network_requests`로 Storage 업로드 요청 상태(200) 확인
- `browser_console_messages`로 콘솔 에러 0건
- 업로드 전·미리보기·저장 후 각각 `browser_take_screenshot` 캡처

---

### Task 011-1: 핵심 기능 통합 E2E 테스트 (Playwright MCP 전용) ✅

**목표**: Task 007~011의 개별 테스트를 통과한 뒤 전체 관리자 워크플로우를 단일 시나리오로 묶어 회귀 방지

**풀 플로우 시나리오** (단일 브라우저 세션에서 연속 실행)

1. `browser_navigate("/login")` → 관리자 이메일/비밀번호 입력 → 로그인
2. 테넌트 관리 → 신규 테넌트 "통합테스트몰" 등록 → `browser_snapshot`
3. 사용자 관리 → "통합테스트몰" 선택 → 사용자 2명 등록(관리자/일반) → `browser_snapshot`
4. 공통코드 관리 → 마스터 "AD_POSITION" + 코드값 3개(TOP/MIDDLE/BOTTOM) 등록 → `browser_snapshot`
5. 광고 관리 → "통합테스트몰" 선택 → 각 위치에 이미지 업로드 및 활성화 → `browser_snapshot`
6. 각 단계마다 `browser_take_screenshot` 캡처
7. **클린업** (역순 삭제): 광고 → 코드값 → 코드마스터 → 사용자 → 테넌트

**권한 매트릭스 검증**

| 대상 | 시나리오 | 기대 결과 |
|------|----------|-----------|
| 비인증 | 5개 `(admin)` 라우트 전수 접근 | 전부 `/login` 리디렉션 |
| 일반 사용자 (비관리자) | 5개 라우트 전수 접근 | 전부 차단 |
| 로그아웃 후 뒤로가기 | 브라우저 히스토리 사용 | 캐시된 페이지 노출 금지 |

**에러 복구 검증**
- 광고 업로드 중 네트워크 단절 시뮬레이션 → UI 에러 토스트 → 재시도 성공
- Server Action 500 에러 → 사용자 친화적 에러 메시지
- 동시 수정 (두 탭) → 마지막 저장 우선 또는 충돌 감지 동작 확인

**UX 회귀 확인**
- 다크모드 전환 후 전 메뉴 스타일 이상 없음 (`browser_take_screenshot`)
- 모바일 뷰포트 (`browser_resize` 375×667) 에서 햄버거 메뉴 및 모달 정상
- 키보드 내비게이션 (Tab, Enter, Esc) 으로 폼 조작 가능 (`browser_press_key`)

**성능 스모크**
- 100개+ 더미 데이터 삽입 후 DataTable 정렬·페이지네이션 응답 시간 체감 확인
- `browser_network_requests`로 응답 시간 >3s 요청 식별

**결과 산출물**
- 모든 시나리오 통과 스크린샷 세트
- `browser_console_messages` 최종 덤프에 에러 0건 확인
- `browser_network_requests` 최종 덤프에 4xx/5xx 0건 확인
- 실패 케이스 발견 시 해당 Task로 되돌아가 수정 후 재실행

---

## Phase 4: 고급 기능 및 최적화 ✅

### Task 012: 사용성 개선 및 부가 기능 ✅

**목표**: 운영 품질 향상을 위한 공통 인프라 강화

**구현 항목**
- ✅ 공통 로딩 Skeleton + ErrorBoundary 표준화 (모든 페이지 적용)
- ✅ 감사 로그(audit_log) 자동 기록 — Server Action 공통 래퍼에 포함
- ✅ 삭제 전 비밀번호 재확인 다이얼로그 (민감 작업 보호)
- ✅ 키보드 단축키 (`Ctrl+N` 등록, `Esc` 닫기) 및 접근성 개선 (ARIA, 포커스 트랩)
- ✅ 테이블 컬럼 정렬 상태 URL 쿼리 파라미터 동기화 (새로고침 시 유지)

---

### Task 013: 성능 최적화 및 배포 ✅

**목표**: 프로덕션 배포 및 성능 최적화

**구현 항목**
- ✅ DataTable 서버 페이지네이션·정렬 최적화 (윈도우 기반 페이지 UI 개선)
- ✅ Next.js Turbopack 빌드 최적화 + 번들 분석 (`@next/bundle-analyzer`)
- ✅ `next/image` 적용 및 Supabase Storage CDN URL 연결
- ✅ Vercel 배포 준비 — 환경 변수 문서화(`docs/DEPLOY.md`), `next.config` 프로덕션 최적화
- ✅ `npm run check-all` CI 연동 — TypeScript·ESLint·Prettier 통합 검사 (`GitHub Actions`)
- ✅ Husky pre-commit 훅 점검 (`lint-staged` 설정 완료)
- ✅ 프로덕션 빌드 검증 (`npm run build` 성공)

---

### Task 014: 운영 품질 개선 — 버그 수정 및 내 정보 실데이터 연결 ✅

**목표**: 운영 테스트에서 발견된 버그를 수정하고, 하드코딩된 더미 데이터를 Supabase 실데이터로 교체

**구현 항목**

#### 화면 분할(Split View) 버그 수정
- ✅ `app/page.tsx` — 루트(`/`) → `/tenants` 리디렉트 시 `?embed=1` 파라미터 소실 문제 수정 (`searchParams` 수신 후 suffix 보존)
- ✅ `lib/stores/mdi-store.ts` — `toggleSplit` 시 홈 탭(`id: "home"`)을 건너뛰고 실 컨텐츠 탭을 secondary로 우선 선택하도록 개선
- ✅ `app/(admin)/layout.tsx` — `useSearchParams()` 사용을 위한 `<Suspense>` 경계 추가 (Next.js 15 요구사항)

#### 내 정보/권한 설정 (F012) 실데이터 연결
- ✅ `lib/actions/profile.ts` 신규 — `getMyProfile()` / `updateMyProfile()` 서버 액션
  - `getMyProfile()`: Supabase Auth UID → `users` 테이블 조회 (`user_id`, `email`, `name`, `phone`, `role` 반환)
  - `updateMyProfile()`: `name`, `phone` 수정 + 비밀번호 입력 시 Supabase Auth 비밀번호 변경
- ✅ `components/frame/top-bar.tsx` — async Server Component로 전환, `getMyProfile()` 호출 후 `UserProfileMenu`에 props 전달
- ✅ `components/frame/user-profile-menu.tsx` — 하드코딩 `DUMMY_USER` 제거, props 기반 실데이터 표시
  - 상단 버튼: `{role 한국어} {name}` 형식 (예: "관리자 지찬영")
  - 팝오버 헤더: name + role (소속/department 컬럼은 users 테이블에 없어 표시 제거)
- ✅ `components/frame/my-info-dialog.tsx` — 하드코딩 `CURRENT_USER` 제거, 서버 액션 연결
  - 다이얼로그 오픈 시 `getMyProfile()` 호출로 실시간 사용자 정보 로드
  - **소속(department) 필드 삭제**: users 테이블에 해당 컬럼 없음
  - 저장 시 `updateMyProfile()` 호출, 성공/실패 토스트 처리

#### 검증 결과 (Playwright MCP)
| 시나리오 | 결과 |
|---------|------|
| 설정 아이콘 → 팝오버 "내 정보/권한 설정" 표출 | ✅ 통과 |
| "내 정보/권한 설정" 클릭 → 다이얼로그 오픈 | ✅ 통과 |
| 프로필 메뉴에서 "내 정보/권한 설정" 항목 제거 확인 | ✅ 통과 |
| 화면 분할 → 우측 iframe 크롬 없이 콘텐츠만 표시 | ✅ 통과 (수정 후) |
| Top Bar 실데이터 표시 (관리자 지찬영) | ✅ 통과 |
| 내 정보 다이얼로그 실데이터 로드 (소속 필드 없음) | ✅ 통과 |

---

## 진행 상황

| Task | 제목 | 상태 |
|------|------|------|
| 001 | 프로젝트 구조 및 라우팅 설정 | ✅ 완료 |
| 002 | 타입 정의 및 인터페이스 설계 | ✅ 완료 |
| 003 | 공통 컴포넌트 라이브러리 구현 | ✅ 완료 |
| 004 | 관리자 레이아웃 및 네비게이션 | ✅ 완료 |
| 005 | 모든 페이지 UI 구현 (더미 데이터) | ✅ 완료 |
| 2.5 | UI/UX 세부표준 적용 & 공통 컴포넌트 리팩토링 | ✅ 완료 |
| 006 | 공통 API 레이어 구축 | ✅ 완료 |
| 007 | 관리자 인증 시스템 구현 (F010) | ✅ 완료 |
| 008 | 테넌트 관리 기능 구현 (F001) | ✅ 완료 |
| 009 | 사용자 관리 기능 구현 (F002) | ✅ 완료 |
| 010 | 공통코드 관리 기능 구현 (F003) | ✅ 완료 |
| 011 | 광고 관리 기능 구현 (F004, F011) | ✅ 완료 |
| 011-1 | 핵심 기능 통합 E2E 테스트 | ✅ 완료 |
| 012 | 사용성 개선 및 부가 기능 | ✅ 완료 |
| 013 | 성능 최적화 및 배포 | ✅ 완료 |
| 014 | 운영 품질 개선 — 버그 수정 및 내 정보 실데이터 연결 | ✅ 완료 |

---

## 관리자 레이아웃 프레임 규격 (Phase 2.5 확정)

- 기준 설계 해상도: 1920 × 1080 (16:9)
- 최소 지원 폭: 1280 px (미만은 body-level 가로 스크롤 허용)
- TopBar: h-14 고정
- LeftPanel: 메인메뉴바 w-14 + 서브메뉴 w-[184px] (열림 240 / 접힘 76)
- MdiTabBar: h-10 고정
- Contents 영역: flex-1 + overflow-auto (와이드 모니터 자연 확장, max-w 금지)

---

## 개발 환경 (확정 기준)

| 항목 | 값 |
|------|----|
| Node.js 최소 요구사항 | 20.9+ |
| Node.js 실 개발 환경 | v24.14.0 |
| 패키지 매니저 | npm |
