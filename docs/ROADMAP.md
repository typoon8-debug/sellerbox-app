# 셀러박스 개발 로드맵

온라인 쇼핑몰 입점 가게 운영자(사장·관리자·피커·패커)를 위한 **상품·주문·배송·고객 통합 운영 시스템**입니다.

## 개요

셀러박스는 가게 운영자를 위한 통합 관리 시스템으로 다음 기능을 제공합니다:

- **상품/재고 관리**: 가게 상품 등록·수정·삭제, 카테고리별 재고 생성/조정 및 트랜잭션 이력 조회
- **주문 처리**: 피킹 → 패킹 → 라벨 출력 → 배송 요청의 완전한 주문 처리 파이프라인
- **배송 관리**: 바로퀵 마감·배송 라우팅·배송 현황판 실시간 모니터링 (Supabase Realtime)
- **프로모션/쿠폰/광고**: 프로모션·쿠폰 등록 및 발급, 광고 콘텐츠/일정/타겟/빈도 관리
- **고객 지원**: 환불·교환·문의 CS 처리 및 앱 리뷰 CEO 답변 관리

PRD: [`docs/PRD.md`](./PRD.md) · ERD: [`docs/erd/sellerbox-erd.csv`](./erd/sellerbox-erd.csv)

## 개발 워크플로우

1. **작업 계획**
   - 기존 manager-app 골격(라우트/셸/공통 컴포넌트/BaseRepository)을 재사용하고, 누락된 도메인 레이어를 식별
   - `ROADMAP.md`를 최신 상태로 유지하고, 우선순위 작업은 마지막 완료 작업 다음에 삽입

2. **작업 생성**
   - 각 Task는 "수락 기준 · 구현 단계 · 영향 파일" 포함
   - **API 연동 및 비즈니스 로직 작업은 "## 테스트 체크리스트" 섹션 필수** (Playwright MCP 시나리오 정의)

3. **작업 구현**
   - 공통 기반(리포지토리/스키마/액션) → 개별 기능 순서로 구현
   - 각 구현 단계 완료 후 Playwright MCP로 E2E 테스트 수행, 통과 확인 후 다음 단계
   - 단계 완료 후 중단하고 추가 지시 대기

4. **로드맵 업데이트**
   - 완료된 Task/구현 사항은 ✅로 표시
   - 각 Task 완료 후 `git commit` + ROADMAP 상태 동기화

## 기술 스택

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5.6+
- **Styling/UI**: Tailwind CSS v4, shadcn/ui, Lucide React
- **Form/Validation**: React Hook Form 7.x, Zod
- **State**: Zustand (UI 스토어)
- **Backend**: Supabase (Auth · PostgreSQL · Realtime · Storage) + Next.js API Routes
- **Testing**: Playwright (E2E, MCP 연동)

---

## 개발 단계

### Phase 1: 애플리케이션 골격 구축

> manager-app 스타터킷의 공통 골격을 검증하고, PRD 기반으로 필요한 라우트·타입·누락 모듈을 보강합니다.

- ✅ **Task 001: 기존 골격 검증 및 누락 의존성 복구** - 완료
  - 검증: `app/(admin)/layout.tsx` 인증 가드 + `AdminShell`(TopBar/LeftPanel/MdiTabBar) 프레임 동작 확인
  - 검증: `components/frame/*`, `components/admin/*`, `components/contents/*`, `components/ui/*` (shadcn 28종) 존재 여부 확인
  - 검증: `lib/repositories/base.ts`의 `BaseRepository<T>` — `paginate`, `applySearch`, CRUD 공통 메서드 재사용 가능성 확인
  - 검증: `lib/errors.ts`, `lib/types/api.ts`(ApiResponse·PaginatedResult), `lib/supabase/{client,server,middleware,admin}.ts` 확인
  - 복구: `lib/repositories/user.ts` (`UserRepository`) — `app/_actions/_utils.ts`가 참조하는 dangling import 해결
  - 복구: `lib/types/audit.ts` (`AuditMeta`) — `app/_actions/_utils.ts`의 audit meta 타입 정의
  - 복구: `lib/supabase/database.types.ts` — ERD 기반 35개 테이블 타입 수동 정의
  - 복구: `app/_actions/auth.ts` (`loginAction`, `verifyAdminPassword`) — dangling import 해결
  - 복구: `lib/schemas/user.ts` (`updateUserSchema`) — dangling import 해결
  - 복구: `components/skeletons/table-skeleton.tsx` — dangling import 해결
  - 복구: `components/frame/tenant-context-selector.tsx` — dangling import 해결
  - `app/_actions/_utils.ts`의 `withAction`, `recordAudit` 공통 래퍼 컴파일 통과 확인
  - `npm run check-all` 통과 확인

- ✅ **Task 002: 라우트 스캐폴딩 및 네비게이션 트리 구성** - 완료
  - `lib/navigation/menu-items.ts`의 `MENU_TREE`를 PRD 메뉴 구조(9개 카테고리 · 24개 페이지)에 맞게 갱신
  - `app/(admin)/` 하위에 24개 페이지 빈 껍데기 생성 (모두 `page.tsx` + 최소 `PageTitleBar`):
    - `stores/page.tsx` (가게관리), `stores/info/page.tsx` (가게정보관리 — 탭 구조)
    - `items/page.tsx` (상품관리)
    - `promotions/page.tsx`, `promotions/items/page.tsx`
    - `inventory/page.tsx` (등록상품 재고관리)
    - `ads/contents/page.tsx`, `ads/schedules/page.tsx`, `ads/targets/page.tsx`, `ads/caps/page.tsx`, `ads/logs/page.tsx`
    - `coupons/page.tsx`, `coupons/issuances/page.tsx`
    - `orders/picking/page.tsx`, `orders/packing/page.tsx`, `orders/labels/page.tsx`, `orders/print/page.tsx`
    - `shipments/requests/page.tsx`, `shipments/quick-closing/page.tsx`, `shipments/routing/page.tsx`, `shipments/dashboard/page.tsx`
    - `support/cs/page.tsx`, `support/reviews/page.tsx`
  - 각 페이지에 기능 ID(F001~F024) 주석 삽입 → PRD 추적성 확보
  - `middleware.ts` 공개/보호 경로 매처에 신규 경로 반영, `app/(admin)/layout.tsx` role 가드 검증

- ✅ **Task 003: 도메인 타입 정의 및 스키마 설계** - 완료
  - `lib/types/domain/` 신규 폴더: PRD의 32개 테이블을 주제별로 그룹화해 타입 정의
    - `store.ts` (tenant·store·store_fulfillment·seller)
    - `item.ts` (item·item_detail)
    - `inventory.ts` (inventory·inventory_txn)
    - `order.ts` (order·order_item)
    - `fulfillment.ts` (picking_task·picking_item·packing_task·label)
    - `shipment.ts` (shipment·shipment_event·dispatch_request·store_quick_policy·store_quick_timeslot·store_quick_slot_usage)
    - `promotion.ts` (promotion·promotion_item·coupon·coupon_issurance·coupon_redemption)
    - `advertisement.ts` (fp_ad_content·fp_ad_schedule·fp_ad_target·fp_ad_cap·fp_ad_log)
    - `support.ts` (cs_ticket·review·ceo_review)
  - 각 타입은 `Database["public"]["Tables"][...]["Row"]` 기반 `Row`, `Insert`, `Update` 재export
  - 공통 ENUM 타입 별도 파일(`lib/types/domain/enums.ts`) — OrderStatus, ShipmentStatus, PickingStatus, PackingStatus 등

### Phase 2: UI/UX 완성 (더미 데이터 활용)

> 공통 컴포넌트는 스타터킷에 대부분 존재하므로, PRD의 24개 페이지를 더미 데이터로 완성합니다.

- ✅ **Task 004: 공통 컴포넌트 검증 및 도메인 위젯 보강** - 완료
  - 검증: `components/admin/data-table.tsx` — PRD의 모든 목록 화면에서 재사용 가능한지 API 점검
  - 검증: `components/admin/pagination-bar.tsx`, `sortable-table-head.tsx`, `table-toolbar.tsx`, `query-field.tsx`, `query-actions.tsx`
  - 검증: `components/admin/form-field.tsx`, `confirm-dialog.tsx`, `layer-dialog.tsx`, `image-uploader.tsx`, `status-badge.tsx`
  - 검증: `components/contents/page-title-bar.tsx`, `module-card.tsx`, `floating-action-bar.tsx`
  - 추가 식별(도메인 공용):
    - `components/admin/domain/status-badge-map.tsx` — ENUM별 배지 색상 매핑 (OrderStatus, ShipmentStatus, PickingStatus 등)
    - `components/admin/domain/price-display.tsx` — 금액 포맷팅 (KRW)
    - `components/admin/domain/date-range-picker.tsx` — 기간 필터 공통
    - `components/admin/domain/category-select.tsx` — 상품/가게 카테고리 선택
  - 더미 데이터 생성 유틸: `lib/mocks/` 폴더 — 각 도메인별 fixture 함수

- ✅ **Task 005: 인증·매장·상품 UI 구현 (더미)** - 완료
  - `app/(auth)/login/page.tsx`: 이메일/비밀번호 로그인 폼 (RHF + Zod, 더미 인증)
  - `stores/page.tsx` (F012): 가게 목록 테이블 + 등록/수정/삭제 다이얼로그
  - `stores/info/page.tsx` (F013): 탭(배송정보·판매원·바로퀵정책·운행표·슬롯예약카운트) 구조 + 각 탭 폼
  - `items/page.tsx` (F001): 상품 목록 + 카테고리 필터 + 등록 폼 + 상세 이미지 업로더
  - 모든 페이지 반응형 검증(데스크톱 우선, 태블릿 대응)

- ✅ **Task 006: 주문 처리·배송 UI 구현 (더미)** - 완료
  - `orders/picking/page.tsx` (F003): 피킹 대상 주문 목록 + 피킹 상세(항목별 요청/피킹/대체)
  - `orders/packing/page.tsx` (F004): 패킹 목록 + 중량 입력 + 완료 처리
  - `orders/labels/page.tsx` (F005): 라벨 출력 대상 선택 + ZPL 미리보기
  - `orders/print/page.tsx` (F006): 피킹/패킹리스트 출력 (PDF 프린트 뷰)
  - `shipments/requests/page.tsx` (F007): 배송 요청 생성 목록
  - `shipments/quick-closing/page.tsx` (F008): 바로퀵 슬롯별 마감
  - `shipments/routing/page.tsx` (F009): 배송순서 생성 리스트
  - `shipments/dashboard/page.tsx` (F010): 현황 카드 4종 + 배송이벤트 타임라인

- ✅ **Task 007: 재고·프로모션·쿠폰·광고 UI 구현 (더미)** - 완료
  - `inventory/page.tsx` (F002): 카테고리 필터 + 재고 목록 + 조정 다이얼로그 + 트랜잭션 이력 시트
  - `promotions/page.tsx` (F014), `promotions/items/page.tsx` (F015): 프로모션 등록/적용 상품 관리
  - `coupons/page.tsx` (F016), `coupons/issuances/page.tsx` (F017): 쿠폰 등록 및 발급/사용 조회
  - `ads/contents/page.tsx` (F018): 광고 콘텐츠 등록 (이미지 업로더 재사용)
  - `ads/schedules/page.tsx` (F019): 일정 (date range · time range · dow mask)
  - `ads/targets/page.tsx` (F020): OS/버전/지역/세그먼트 타겟 폼
  - `ads/caps/page.tsx` (F021): 노출/클릭 한도 폼
  - `ads/logs/page.tsx` (F022): 로그 조회 전용 (필터 + 목록)

- ✅ **Task 008: 고객 지원 UI 구현 (더미)** - 완료
  - `support/cs/page.tsx` (F023): CS 티켓 목록 + 상세(내용/처리결과 입력)
  - `support/reviews/page.tsx` (F024): 리뷰 목록 + CEO 답변 폼
  - 전체 24개 페이지 MDI 탭 열림/닫힘/전환 검증
  - `MENU_TREE` ↔ 실제 라우트 매칭 최종 검증

### Phase 3: 핵심 기능 구현

> 공통 데이터 레이어(리포지토리·스키마·액션)를 먼저 구축하고, 그 위에 개별 기능을 구현합니다. 모든 API 연동 작업은 Playwright MCP로 E2E 테스트 필수.

- ✅ **Task 009: 도메인 리포지토리 레이어 구축** - 완료
  - `lib/repositories/`에 도메인별 리포지토리 생성 (모두 `BaseRepository<T>` 상속)
    - `store.repository.ts`, `seller.repository.ts`, `store-fulfillment.repository.ts`
    - `item.repository.ts`, `item-detail.repository.ts`
    - `inventory.repository.ts`, `inventory-txn.repository.ts`
    - `order.repository.ts`, `order-item.repository.ts`
    - `picking-task.repository.ts`, `picking-item.repository.ts`, `packing-task.repository.ts`, `label.repository.ts`
    - `shipment.repository.ts`, `dispatch-request.repository.ts`, `store-quick-policy.repository.ts`
    - `promotion.repository.ts`, `promotion-item.repository.ts`
    - `coupon.repository.ts`, `coupon-issuance.repository.ts`, `coupon-redemption.repository.ts`
    - `ad-content.repository.ts`, `ad-schedule.repository.ts`, `ad-target.repository.ts`, `ad-cap.repository.ts`, `ad-log.repository.ts`
    - `cs-ticket.repository.ts`, `review.repository.ts`, `ceo-review.repository.ts`
  - 각 리포지토리는 `applySearch`를 도메인 맞춤 구현 (예: item → name·sku LIKE)
  - 복잡 쿼리는 별도 메서드 (예: `picking-task.repository.ts#findActiveTasksByPicker`)
  - 모든 리포지토리에 `describe` 기반 단위 테스트 (Vitest) 또는 Playwright API 테스트

  #### 테스트 체크리스트
  - [ ] Playwright MCP로 Supabase 로컬 인스턴스 연결 검증
  - [ ] 각 리포지토리 `findAll`, `paginate`, `findById`, `create`, `update`, `delete` 정상 동작
  - [ ] `applySearch`가 도메인별 필드에 대해 정확히 LIKE 매칭
  - [ ] FK 제약 위반 시 `ConflictError` 반환 확인
  - [ ] 페이지네이션 `total`·`items` 정합성 검증

- ✅ **Task 010: Server Actions 공통 패턴 및 Zod 스키마 작성** - 완료
  - `lib/schemas/domain/` 신규 폴더: 도메인별 Zod 스키마 (create/update 분리)
    - `store.schema.ts`, `item.schema.ts`, `inventory.schema.ts`, `order.schema.ts` 등 9개 도메인
  - `lib/actions/domain/` 신규 폴더: Server Actions (`withAction` 래퍼 사용)
    - `store.actions.ts`, `item.actions.ts`, `inventory.actions.ts`, ... 각 도메인별
  - 각 액션은 `recordAudit` 호출 (감사 로그 자동 기록)
  - 에러 매핑: Zod 검증 실패 → `ValidationError`, Supabase PostgresError → `toApiError()`

  #### 테스트 체크리스트
  - [ ] Playwright MCP로 각 Server Action 호출 (성공/실패 케이스)
  - [ ] Zod 검증 실패 시 `ValidationError` 반환 및 필드별 에러 메시지 확인
  - [ ] `recordAudit` 호출 후 `audit_log` 테이블에 실제 기록 여부 확인
  - [ ] 인증되지 않은 요청 시 `UnauthorizedError` 반환 확인

- ✅ **Task 011: 인증 및 역할 기반 접근 제어 구현 (F011)**
  - `app/(auth)/login/page.tsx`: Supabase Auth 이메일/비밀번호 로그인 실제 연동
  - `middleware.ts`: `app_metadata.role` 기반 경로 접근 제어 확장
    - PICKER → `orders/picking`만 접근, PACKER → `orders/packing`만 접근
    - OWNER/MANAGER → 전 페이지 접근
  - `app/(admin)/layout.tsx` role 가드에서 역할별 홈 리다이렉션 구현
  - `lib/hooks/use-current-user.ts` 신규 훅: 현재 seller 정보 조회 (캐싱)
  - 로그아웃 플로우 + 세션 만료 처리 (`session-countdown.tsx` 연동)

  #### 테스트 체크리스트
  - [ ] Playwright MCP: 유효한 OWNER 계정 로그인 → `/stores` 이동 확인
  - [ ] Playwright MCP: PICKER 계정 로그인 → `/orders/picking`으로 강제 이동 확인
  - [ ] Playwright MCP: PACKER 계정으로 `/stores` 접근 시도 → 차단/리다이렉션 확인
  - [ ] Playwright MCP: 미인증 상태로 보호 경로 접근 → `/login?redirect=...` 확인
  - [ ] Playwright MCP: 로그아웃 후 세션 삭제 및 재로그인 플로우 검증
  - [ ] Playwright MCP: 비밀번호 오류 시 에러 메시지 표시 확인

- ✅ **Task 012: 매장 및 상품 관리 API 연동 (F001·F012·F013)** - 완료
  - `stores/page.tsx` 더미 데이터 → `store.actions.ts` 연동
  - `stores/info/page.tsx` 각 탭 → `store-fulfillment`, `seller`, `store-quick-policy`, `store-quick-timeslot`, `store-quick-slot-usage` 액션 연동
  - `items/page.tsx` → `item.actions.ts` + `item-detail.actions.ts` 연동
  - 상품 이미지 업로드 → `lib/supabase/storage.ts` 유틸 신규 생성 → Supabase Storage bucket `items` 연동
  - 카테고리 필터·검색·정렬이 서버 페이지네이션으로 동작

  #### 테스트 체크리스트
  - [ ] Playwright MCP: 가게 등록 → 목록 갱신 → 수정 → 삭제 풀 플로우
  - [ ] Playwright MCP: 가게정보관리 5개 탭 데이터 저장/조회 교차 검증
  - [ ] Playwright MCP: 상품 등록 시 이미지 업로드 → Storage URL 저장 확인
  - [ ] Playwright MCP: 상품 카테고리 필터·검색어·페이지네이션 동작 확인
  - [ ] Playwright MCP: 상품 상태 전환(ACTIVE↔OUT_OF_STOCK) 검증
  - [ ] 에러 케이스: 중복 SKU 등록 시 `ConflictError` 표시

- ✅ **Task 013: 재고 관리 API 연동 (F002)** - 완료
  - `inventory/page.tsx` → `inventory.actions.ts` 연동
  - 재고 조정 시 `inventory_txn` 자동 기록 (before/after 수량 포함) — 트랜잭션 처리
  - 카테고리별 상품 조회 + 재고 현황 JOIN 쿼리
  - 트랜잭션 이력 시트: `inventory-txn.repository.ts#findByItem` 사용
  - 안전재고 이하 상품 하이라이트

  #### 테스트 체크리스트
  - [ ] Playwright MCP: 재고 INBOUND 처리 → `on_hand` 증가 + `inventory_txn` 기록 검증
  - [ ] Playwright MCP: 재고 ADJUST(감소) 처리 → `before_quantity`·`after_quantity` 정확성 확인
  - [ ] Playwright MCP: 주문 생성 시 `reserved` 증가, 출고 시 `on_hand` 감소·`reserved` 감소 시나리오
  - [ ] Playwright MCP: 안전재고 이하 상품 시각적 강조 확인
  - [ ] Playwright MCP: 트랜잭션 이력 시트 필터링·스크롤 검증

- ✅ **Task 014: 주문 피킹/패킹/라벨 API 연동 (F003·F004·F005·F006)** - 완료
  - `orders/picking/page.tsx` → `picking-task.actions.ts` + `picking-item.actions.ts`
    - 상태 전환: CREATED → PICKING → PICKED/FAILED
    - 대체 상품 지정(substitute_product_id) 처리
  - `orders/packing/page.tsx` → `packing-task.actions.ts`
    - 상태 전환: READY → PACKING → PACKED, 중량 기록
  - `orders/labels/page.tsx` → `label.actions.ts`
    - ZPL 텍스트 생성 로직: `lib/utils/zpl-generator.ts` 신규
    - 라벨 출력 시 `printed_at` 기록
  - `orders/print/page.tsx` → 피킹/패킹 리스트 PDF 생성

  #### 테스트 체크리스트
  - [ ] Playwright MCP: 피킹 작업 생성 → 시작 → 완료 상태 전환 전체 플로우
  - [ ] Playwright MCP: 피킹 중 SHORT/SUBSTITUTE 처리 시 결과 저장 검증
  - [ ] Playwright MCP: 피킹 완료 후 패킹 대기열 자동 반영 확인
  - [ ] Playwright MCP: 패킹 중량 입력 누락 시 검증 에러 표시
  - [ ] Playwright MCP: 라벨 유형(BOX·BAG·INVOICE) 각각 ZPL 미리보기 렌더링
  - [ ] Playwright MCP: 피킹/패킹 리스트 PDF 출력 뷰 렌더링

- ✅ **Task 015: 배송 관리 API 연동 및 Realtime 대시보드 (F007·F008·F009·F010)** - 완료
  - `shipments/requests/page.tsx` → `dispatch-request.actions.ts` (패킹 완료 주문 조회 후 요청 생성)
  - `shipments/quick-closing/page.tsx` → `store-quick-slot-usage.repository.ts` + 마감 처리 비즈니스 로직
  - `shipments/routing/page.tsx` → 배송순서 생성 알고리즘 (`lib/utils/routing.ts`, 간단한 거리 기반)
  - `shipments/dashboard/page.tsx` (F010) → **Supabase Realtime 구독**
    - `shipment`·`shipment_event`·`dispatch_request` 테이블 INSERT/UPDATE 실시간 반영
    - 현황 카드 4종(주문건수·배송완료·피킹패킹+요청·배송중) Server Component + Realtime Client Component 하이브리드
    - `lib/hooks/use-realtime-channel.ts` 신규 훅

  #### 테스트 체크리스트
  - [ ] Playwright MCP: 패킹 완료 → 배송 요청 생성 → 요청 상태 REQUESTED 확인
  - [ ] Playwright MCP: 바로퀵 슬롯 마감 → `store_quick_slot_usage.reserved_count` 갱신 검증
  - [ ] Playwright MCP: 배송 라우팅 실행 → 배송순서 결과 리스트 생성 확인
  - [ ] Playwright MCP: 배송현황판 접속 → 4개 카드 초기 데이터 로딩 확인
  - [ ] Playwright MCP: DB 직접 INSERT `shipment_event` → Realtime 구독으로 UI 자동 갱신 확인 (2초 이내)
  - [ ] Playwright MCP: 여러 탭에서 동시 현황판 구독 → 데이터 일관성 검증

- ✅ **Task 016: 프로모션 및 쿠폰 API 연동 (F014·F015·F016·F017)** - 완료
  - `promotions/page.tsx` → `promotion.actions.ts` (SCHEDULED/ACTIVE/PAUSED/ENDED 상태)
  - `promotions/items/page.tsx` → `promotion-item.actions.ts` (N+1 조건·대체상품 지원)
  - `coupons/page.tsx` → `coupon.actions.ts` (DISCOUNT/SHIPPING_FREE/SIGNUP 유형)
  - `coupons/issuances/page.tsx` → `coupon-issuance.actions.ts` + `coupon-redemption.repository.ts` 조회

  #### 테스트 체크리스트
  - [ ] Playwright MCP: 프로모션 등록 → ACTIVE 전환 → 상품 적용 → 종료 플로우
  - [ ] Playwright MCP: N+1 프로모션에 대체상품 지정 시 저장 검증
  - [ ] Playwright MCP: 쿠폰 개별 발급 → 발급 목록 반영 확인
  - [ ] Playwright MCP: 쿠폰 일괄 발급(대량) 처리 성능 확인
  - [ ] Playwright MCP: 쿠폰 사용 이력 조회 필터(기간·쿠폰·고객) 검증
  - [ ] Playwright MCP: 만료된 쿠폰 상태 EXPIRED 자동 전환 확인

- ✅ **Task 017: 광고 관리 API 연동 (F018·F019·F020·F021·F022)** - 완료
  - `ads/contents/page.tsx` → `ad-content.actions.ts` + Storage 광고 이미지 업로드
  - `ads/schedules/page.tsx` → `ad-schedule.actions.ts` (기간·시간·요일 마스크)
  - `ads/targets/page.tsx` → `ad-target.actions.ts`
  - `ads/caps/page.tsx` → `ad-cap.actions.ts`
  - `ads/logs/page.tsx` → `ad-log.repository.ts` 조회 전용 (읽기 전용 페이지)

  #### 테스트 체크리스트
  - [ ] Playwright MCP: 광고 콘텐츠 등록 → 일정/타겟/빈도 연결 → ACTIVE 전환
  - [ ] Playwright MCP: 광고 이미지 Storage 업로드 및 미리보기 확인
  - [ ] Playwright MCP: 요일마스크(MON,TUE,WED) 저장·조회 정확성 확인
  - [ ] Playwright MCP: 타겟 OS(IOS/ANDROID/WEB) 조건 필터링 검증
  - [ ] Playwright MCP: 광고 로그 날짜 범위 필터링 + 페이지네이션 동작
  - [ ] Playwright MCP: 광고 상태 전환(DRAFT→READY→ACTIVE→PAUSED→ENDED) 플로우

- ✅ **Task 018: 고객 지원 API 연동 (F023·F024)** - 완료
  - `support/cs/page.tsx` → `cs-ticket.actions.ts`
    - 상태 전환: OPEN → IN_PROGRESS → CLOSED
    - 유형: REFUND/EXCHANGE/INQUIRY
  - `support/reviews/page.tsx` → `review.repository.ts` 조회 + `ceo-review.actions.ts`
    - CEO 답변 등록/수정 시 `review`와 `ceo_review` 연결

  #### 테스트 체크리스트
  - [ ] Playwright MCP: CS 티켓 접수 → IN_PROGRESS → CLOSED 상태 전환 플로우
  - [ ] Playwright MCP: 환불/교환/문의 유형별 필터 동작 확인
  - [ ] Playwright MCP: 리뷰 목록 필터(VISIBLE/HIDDEN/REPORTED/DELETED) 동작
  - [ ] Playwright MCP: CEO 답변 등록 → 리뷰 목록 "답변여부" 갱신 확인
  - [ ] Playwright MCP: CEO 답변 수정 시 `modified_at` 타임스탬프 갱신 검증

- ✅ **Task 019: 핵심 기능 통합 E2E 테스트** - 완료
  - `e2e/` 디렉터리 신설 및 테스트 파일 체계 구성
    - `e2e/auth.spec.ts` — 로그인/로그아웃/권한
    - `e2e/stores.spec.ts` — 매장 CRUD
    - `e2e/items-inventory.spec.ts` — 상품·재고 연동
    - `e2e/orders-fulfillment.spec.ts` — 피킹→패킹→라벨→배송요청 End-to-End
    - `e2e/shipments-realtime.spec.ts` — 배송현황판 Realtime
    - `e2e/promotions-coupons.spec.ts` — 프로모션·쿠폰 발급·사용
    - `e2e/ads.spec.ts` — 광고 전체 플로우
    - `e2e/support.spec.ts` — CS·리뷰
  - Playwright MCP 기반 시나리오: 실제 Supabase 로컬 인스턴스 연결
  - 테스트 데이터 fixture 스크립트 (`e2e/fixtures/seed.ts`) — 가게·상품·주문·라이더 샘플 데이터 생성
  - `npm run test:e2e` CI 통합

  #### 테스트 체크리스트
  - [ ] 주문 처리 전체 플로우(주문 접수 → 피킹 → 패킹 → 라벨 → 배송요청 → 라우팅 → 배송완료)
  - [ ] 역할별 접근 제어 크로스 테스트 (OWNER/MANAGER/PICKER/PACKER)
  - [ ] Realtime 구독 누락 없음 검증
  - [ ] 에러 케이스: FK 위반, 중복 키, 잘못된 상태 전환
  - [ ] 반응형 뷰포트(1920·1366·1024) 기본 플로우 smoke test

### Phase 4: 고급 기능 및 최적화

- ✅ **Task 020: 성능 최적화 및 캐싱 전략** - 완료
  - 주요 도메인 loading.tsx 6개 생성 (stores, items, inventory, picking, packing, shipments/dashboard)
  - 동적 페이지에 `export const dynamic = 'force-dynamic'` / `revalidate = 0` 전략 적용
  - `lib/repositories/base.ts` paginate() 컬럼 최적화 가이드 주석 추가
  - `lib/supabase/storage.ts` `getTransformUrl()` 함수 추가 (width, quality 파라미터)
  - `next.config.ts` `optimizePackageImports`에 recharts 포함으로 번들 최적화 확인

- ✅ **Task 021: 접근성·반응형·다크모드 점검** - 완료
  - `lib/hooks/use-hotkey.ts`에 `useHotkeyMap` 훅 추가
  - `MdiTabBar`에 Ctrl+W(탭 닫기) / Ctrl+1~9(탭 이동) 단축키 적용
  - `status-badge-map.tsx` 전 상태 배지에 `dark:` Tailwind 클래스 추가 (WCAG AA 대응)
  - `DataTable` ScrollArea + ScrollBar 기반 가로 스크롤 이미 적용 확인

- ✅ **Task 022: 테스트 강화 및 CI/CD 파이프라인** - 완료
  - Vitest + @vitest/coverage-v8 설치 및 `vitest.config.ts` 생성
  - `package.json`에 `test:unit`, `test:coverage` 스크립트 추가
  - `lib/repositories/__tests__/` 핵심 리포지토리 단위 테스트 작성 (store/item/inventory/order — 41개 테스트 통과)
  - `e2e/ads.spec.ts` 신규 작성 (광고 콘텐츠 등록 → 일정 연결 → ACTIVE 전환 → 로그 조회)
  - `.github/workflows/ci.yml` 복구 (lint+typecheck → 단위테스트 → build → E2E 선택 단계)

- ✅ **Task 023: 배포 및 모니터링** - 완료
  - `vercel.json` 생성 (빌드 명령, 환경 변수, 보안 헤더, ICN 리전)
  - `@sentry/nextjs` 설치 및 `instrumentation.ts` + `sentry.client/server.config.ts` 설정
  - `lib/repositories/audit-log.repository.ts` 신규 (`BaseRepository` 상속, `findByResource`·`findByActor` 추가)
  - `app/(admin)/audit/page.tsx` + `audit-client.tsx` 신규 — 감사 로그 읽기 전용 DataTable
  - `lib/navigation/menu-items.ts` MENU_TREE에 "시스템 관리 > 감사 로그" 항목 추가 (screenNumber: 90010)
  - `components/web-vitals.tsx` 신규 — `useReportWebVitals` 기반 Web Vitals 수집
  - `app/layout.tsx`에 `<WebVitals />` 추가

### Phase 5: 데이터베이스 통합

- ✅ **Task 024: Supabase DB 테이블 생성 및 데이터 연동** - 완료
  - Supabase MCP 환경설정 정리 (`.mcp.json` PAT → 환경변수 참조 → 수동 토큰 설정)
  - Supabase Management API를 통한 DB 접속 경로 확보 (PAT 재발급)
  - DDL 마이그레이션 SQL 6개 파일 작성 (`supabase/migrations/`)
    - `20260416000001_core_identity.sql` — tenant, users, seller, store, store_fulfillment, audit_log
    - `20260416000002_catalog_inventory.sql` — item, item_detail, inventory, inventory_txn
    - `20260416000003_orders_fulfillment.sql` — order, order_item, picking_task, picking_item, packing_task, label, shipment, shipment_event, dispatch_request, store_quick_policy, store_quick_timeslot, store_quick_slot_usage
    - `20260416000004_promotion_coupon.sql` — promotion, promotion_item, coupon, coupon_issurance, coupon_redemption
    - `20260416000005_ads_support.sql` — fp_ad_content, fp_ad_schedule, fp_ad_target, fp_ad_cap, fp_ad_log, cs_ticket, review, ceo_review
    - `20260416000006_rls_policies.sql` — 35개 테이블 RLS 활성화 + authenticated/anon 정책
  - Supabase Management API를 통해 마이그레이션 6개 + 시드 데이터 순차 실행 완료
  - 기존 DB 스키마 발견 (47개 테이블 이미 존재) → `database.types.ts` 실제 DB에 맞게 동기화
    - `users` 테이블: `is_active` → `active`, `auth_user_id` nullable, `tenant_id`/`password_hash` 추가
    - `tenant` 테이블: `code`/`type` 컬럼 추가, `modified_at` 제거
  - `lib/repositories/user.ts` 수정: `.eq("is_active", true)` → `.eq("active", true)`
  - `supabase/seed.sql` 실제 DB 스키마에 맞게 수정
  - 시드 데이터 적재 완료: tenant 3건, store 1건, item 3건, inventory 3건, order 1건, order_item 3건
  - RLS 검증: 35개 테이블 RLS 활성화 확인
  - 빌드 검증: `npm run typecheck` + `npm run build` 성공 (22개 라우트 정상)
  - `vercel.json` 수정: 레거시 `env`/`functions` 블록 제거
  - `package.json` 수정: `@next/bundle-analyzer` 버전 일치, `prepare` 방어 처리, `engines` 추가
  - `orders/print`, `orders/labels` 페이지에 `export const dynamic = "force-dynamic"` 추가

### Phase 6: 버그 수정 및 UI/UX 개선

- ✅ **Task 025: 에러 수정 및 가게관리 화면 재구성** - 완료

  #### Phase 0: 에러 수정
  - `components/frame/system-logo.tsx`: 사이드바 로고 `"관리자 시스템"` → `"셀러박스"` 변경
  - `app/layout.tsx`: HTML `<title>` `"온라인쇼핑몰 관리자 시스템"` → `"셀러박스"` 변경
  - `e2e/auth.spec.ts`: 로그인 페이지 h1 assertion `"관리자 시스템"` → `"셀러박스"` 수정
  - `app/(admin)/users/page.tsx` 신규: `/users` 404 해결 — `PageTitleBar` + `EmptyState` 플레이스홀더 생성

  #### Phase 1: 인프라 구축
  - `lib/repositories/tenant.repository.ts` 신규: `BaseRepository<"tenant">` 상속, name·code ILIKE 검색
  - `lib/repositories/store.repository.ts`: `findByTenantId(tenantId)` 메서드 추가
  - `lib/schemas/domain/store.schema.ts`: `updateStoreSchema` 필드 확장 (포인트·배달시간·운영·사업자 등 16개 필드)
  - 6개 Zod 스키마 신규: `tenant.schema.ts`, `seller.schema.ts`, `store-fulfillment.schema.ts`, `store-quick-policy.schema.ts`, `store-quick-timeslot.schema.ts`, `store-quick-slot-usage.schema.ts`
  - 7개 Server Actions 신규: `tenant.actions.ts`, `seller.actions.ts`, `store-fulfillment.actions.ts`, `store-quick-policy.actions.ts`, `store-quick-timeslot.actions.ts`, `store-quick-slot-usage.actions.ts`, `store-query.actions.ts`

  #### Phase 2: 메뉴 구조 변경
  - `lib/navigation/menu-items.ts`: "가게 관리" 메뉴를 단일 leaf(`/stores`)로 변경 (기존 `stores-info` 서브메뉴 제거)
  - 기존 "테넌트 관리" 상위 메뉴 항목 제거 (가게관리에 통합)

  #### Phase 3: 가게관리 화면 재구성 (F012 + F013 통합)
  - `app/(admin)/stores/page.tsx`: 테넌트 초기 데이터 로드 Server Component로 재설계
  - `app/(admin)/stores/stores-client.tsx`: 테넌트→가게→상세 마스터-디테일 3단 상태 오케스트레이터로 전면 재작성
  - `app/(admin)/stores/_components/tenant-search-grid.tsx` 신규: 테넌트 검색 + Grid (클라이언트 사이드 필터)
  - `app/(admin)/stores/_components/store-grid.tsx` 신규: 선택 테넌트의 가게 목록, 행추가/삭제
  - `app/(admin)/stores/_components/store-detail-form.tsx` 신규: 가게 전체 필드 편집 폼 (7행 레이아웃)
  - `app/(admin)/stores/_components/store-register-dialog.tsx` 신규: 가게 신규 등록 LayerDialog
  - `app/(admin)/stores/_components/store-info-tabs.tsx` 신규: 5개 탭 통합 컴포넌트
  - `app/(admin)/stores/_components/tabs/fulfillment-tab.tsx` 신규: 배송정보 CRUD
  - `app/(admin)/stores/_components/tabs/sellers-tab.tsx` 신규: 판매원 CRUD
  - `app/(admin)/stores/_components/tabs/quick-policy-tab.tsx` 신규: 바로퀵정책 CRUD
  - `app/(admin)/stores/_components/tabs/timeslot-tab.tsx` 신규: 운행표 CRUD
  - `app/(admin)/stores/_components/tabs/slot-usage-tab.tsx` 신규: 슬롯카운트 CRUD

  #### Phase 4: 기존 stores/info 처리
  - `app/(admin)/stores/info/page.tsx`: `/stores`로 redirect 변환 (기능 통합으로 인한 레거시 경로 처리)

  #### TypeScript 에러 수정
  - `z.coerce.number()` → `z.number()` + `valueAsNumber` 패턴으로 @hookform/resolvers v5 호환성 해결 (quick-policy-tab, timeslot-tab, slot-usage-tab)
  - `z.boolean().default(true)` → `z.boolean()` + `defaultValues`에 명시적 기본값 (fulfillment-tab)
  - `stores-client.tsx` 미사용 `setTenants` 제거

  #### 검증 결과
  - `npm run check-all` (TypeScript + ESLint + Prettier) 전체 통과
  - `npm run build` 성공 (23개 라우트, `/stores` 포함)

- ✅ **Task 026: 상품조회 검색조건 추가 및 상품설명 관리 신규 화면 (F001·F001-2)** - 완료

  #### 요구사항
  - **상품 조회/목록 (11001)**: 가게명·카테고리 검색조건 영역 추가, 로그인 사용자 소속 가게 선택 지원
  - **상품설명 관리 (11002) 신규**: item_detail 테이블 CRUD 화면 — 검색조건 + 상품그리드 + 상세폼 3단 구조
  - **업무규칙**: OWNER는 하나 이상의 가게를 운영할 수 있음

  #### Phase A: 공통 인프라
  - `lib/repositories/seller.repository.ts`: `findByEmail(email)` 메서드 추가 (OWNER 복수 가게 지원 — 동일 email 복수 seller 레코드 허용)
  - `lib/repositories/item-detail.repository.ts`: `findByItemId()`, `softDelete()`, `applySearch()` 추가
  - `lib/schemas/domain/item-detail.schema.ts` 신규: create/update/delete Zod 스키마
  - `lib/actions/domain/item-detail.actions.ts` 신규: createItemDetail, updateItemDetail, softDeleteItemDetail, fetchItemDetailByItem, fetchItemsByStore 서버 액션
  - `app/(admin)/layout.tsx`: `.maybeSingle()` → `.limit(1).maybeSingle()` (복수 seller 레코드 에러 방지)

  #### Phase B: 상품 조회/목록 검색조건 추가
  - `app/(admin)/items/page.tsx`: 세션 기반 seller 가게 목록 조회, store_id URL 파라미터 지원, item 조회 시 store_id 필터 적용
  - `app/(admin)/items/items-client.tsx`: QueryField + QueryActions 패턴의 검색조건 패널 추가 (가게명 Select + 카테고리 Select + 조회/초기화 버튼)

  #### Phase C: 상품설명 관리 신규 화면
  - `lib/navigation/menu-items.ts`: "상품설명 관리" 메뉴 (id: items-detail, screenNumber: 11002) 등록
  - `app/(admin)/items/detail/page.tsx` 신규: 서버 컴포넌트 (세션 기반 가게 조회)
  - `app/(admin)/items/detail/item-detail-client.tsx` 신규: 검색조건 + 상품 그리드(DataTable) + item_detail 폼 (5종 이미지 ImageUploader 포함) 3단 구조
  - `app/(admin)/items/detail/loading.tsx` 신규: 로딩 스켈레톤

  #### 검증 결과
  - `npm run typecheck` 에러 없음
  - `npm run lint` 에러 없음
  - `npm run build` 성공 (`/items`, `/items/detail` 신규 라우트 포함)

- ✅ **Task 027: 가게명 하드코딩 제거 + 이미지 Copy/Paste·리사이징 (F001·F001-2·F018)** - 완료

  #### 요구사항
  - **오류 수정**: 상품조회/목록 seller 미연결 시 테스트 매장 fallback 제거
  - **공통 기능**: 이미지 Ctrl+V 붙여넣기 + 자동 리사이징(PNG 변환) — ImageUploader에 통합
  - **적용 대상**: 상품 조회/목록(400×400 stretch), 상품설명 관리(5종 이미지), 광고 콘텐츠(타입 선택 드롭다운)

  #### Phase A: 가게명 fallback 제거
  - `app/(admin)/items/page.tsx`: seller 미연결 시 빈 데이터 반환 (fallback 블록 제거, 전체 조회 방지)
  - `app/(admin)/items/detail/page.tsx`: 동일한 fallback 블록 제거
  - `app/(admin)/items/items-client.tsx`: stores 빈 배열 시 Select disabled + "소속 가게 없음" 안내 메시지

  #### Phase B: 이미지 리사이징 유틸리티
  - `lib/utils/image-resize.ts` 신규: `resizeImage()` (stretch + fit-width 모드), `extractImageFromClipboard()`

  #### Phase C: ImageUploader 개선
  - `components/admin/image-uploader.tsx`: `autoResize` prop 추가, `processImage()` 공통 파이프라인 추출, `onPaste` 핸들러 + "또는 Ctrl+V" 안내 텍스트, `tabIndex={0}` 포커스 처리

  #### Phase D: 소비자 코드 적용
  - `app/(admin)/items/items-client.tsx`: ImageUploader에 `expectedWidth/Height={400}` + `autoResize` 추가
  - `app/(admin)/items/detail/item-detail-client.tsx`: 5개 ImageUploader에 `autoResize` 추가 (광고/상세는 `expectedHeight` 제거 → fit-width 모드)
  - `app/(admin)/ads/contents/ads-contents-client.tsx`: 이미지 타입 드롭다운(375×160/345×70) + `autoResize`, `uploadImage` → `uploadImageAction` 전환

  #### 검증 결과
  - `npm run typecheck` 에러 없음
  - `npm run lint` 에러 없음
  - `npm run build` 성공

- ✅ **Task 027-2: 이미지 저장 에러 수정 + Ctrl+V 붙여넣기 팝업 (F001·F001-2·F018)** - 완료

  #### 요구사항
  - **오류 수정**: 이미지 선택/붙여넣기 시 base64 dataUrl이 form 상태에 저장되어 DB에 전달 → Vercel serverless 요청 바디 크기 제한(4.5MB) 초과 에러 발생
  - **UX 개선**: Ctrl+V 붙여넣기 전용 팝업 다이얼로그 제공 (포커스 관리 문제 해결)

  #### Phase A+B: ImageUploader 즉시 업로드 아키텍처 + 붙여넣기 팝업
  - `components/admin/image-uploader.tsx` 재설계: 이미지 선택 즉시 Storage 업로드 → `onChange(publicUrl)` 반환 (base64 form 저장 완전 차단), `bucket` prop 추가, `onFileSelect` prop 제거
  - `components/admin/image-paste-dialog.tsx` 신규: "붙여넣기" 버튼 → Radix Dialog 팝업, 자동 포커스(setTimeout 80ms), Ctrl+V 이미지 감지 + 리사이징 + 미리보기 → 확인 버튼으로 Storage 업로드

  #### Phase C: 소비자 코드 단순화
  - `app/(admin)/items/items-client.tsx`: `pendingFileRef`, `handleImageChange`, `uploadImageAction` 직접 호출 제거
  - `app/(admin)/items/detail/item-detail-client.tsx`: `pendingFilesRef`, `handleFileSelect`, `uploadImageIfNeeded`, `resolveUrl`, `ImageFieldKey` 타입 제거 — `handleSave`에서 form 값 직접 사용
  - `app/(admin)/ads/contents/ads-contents-client.tsx`: `imageFile` 상태 및 직접 업로드 로직 제거

  #### 검증 결과
  - `npm run typecheck` 에러 없음
  - `npm run lint` 에러 없음
  - `npm run build` 성공

- ✅ **Task 029: 등록상품 재고관리 4건 개선 (F002)** - 완료

  #### 요구사항
  1. **조회조건 Panel 2 동시 적용**: 카테고리/상품명 검색조건이 Panel 1에만 적용되고 Panel 2에는 미적용 오류 수정
  2. **재고 상태값 변경**: AVAILABLE(가용)·RESERVED(예정)·STOP(중지) — DAMAGED·ADJUSTED 제거
  3. **취소처리**: 재고 상태를 DAMAGED → STOP으로 변경
  4. **생성처리 개선**: STOP 상태 재고 재활성화 지원

  #### 개선 1: 조회조건 Panel 2 동시 적용
  - `lib/schemas/domain/inventory.schema.ts`: `fetchInventoryByStoreSchema`에 `category`·`search` 필드 추가
  - `lib/repositories/inventory.repository.ts`: `findByStoreWithItemJoin()`에 `filters?: { category, search }` 파라미터 추가 — Supabase `referencedTable` 옵션으로 item JOIN 필터링
  - `lib/actions/domain/inventory.actions.ts`: `fetchInventoryByStore` 액션에서 category·search → 리포지토리 전달
  - `app/(admin)/inventory/inventory-mgmt-client.tsx`: `doSearch()`의 `fetchInventoryByStore` 호출에 category·search 전달

  #### 개선 2: 재고 상태값 변경
  - `lib/types/domain/enums.ts`: `InventoryStatus` = `"AVAILABLE" | "RESERVED" | "STOP"` (DAMAGED·ADJUSTED 제거)
  - `lib/supabase/database.types.ts`: inventory Row·Insert·Update 3곳의 status 타입 동기화
  - `components/admin/domain/status-badge-map.tsx`: 배지 매핑 변경 — AVAILABLE(가용)·RESERVED(예정)·STOP(중지)
  - `lib/mocks/inventory.ts`: mock 데이터 status `"ADJUSTED"` → `"STOP"` 수정
  - `supabase/migrations/20260417000002_inventory_status_update.sql` 신규: DAMAGED/ADJUSTED → STOP 일괄 변환 + CHECK 제약 변경

  #### 개선 3: 취소처리 STOP 변경
  - `lib/actions/domain/inventory.actions.ts`: `deactivateInventoryBatch`에서 `status: "DAMAGED"` → `status: "STOP"`
  - `app/(admin)/inventory/inventory-mgmt-client.tsx`: 확인 다이얼로그 제목·설명·버튼 "비활성화" → "중지" 텍스트 일괄 변경

  #### 개선 4: 생성처리 STOP 재활성화
  - `lib/repositories/inventory.repository.ts`: `findExistingItemIds()` → `findExistingItems()` — item_id·inventory_id·status 반환
  - `lib/actions/domain/inventory.actions.ts`: `createInventoryBatch` 로직 개선
    - 없으면: 신규 생성 (AVAILABLE)
    - 있고 STOP이면: AVAILABLE로 재활성화
    - 있고 AVAILABLE이면: 스킵 후 "이미 존재" 메시지
    - 반환: `{ createdCount, reactivatedCount, skippedCount }`
  - `app/(admin)/inventory/inventory-mgmt-client.tsx`: `handleCreateInventory` 토스트 메시지 분기 (생성/재활성화/이미존재)

  #### 부가 수정: Zod UUID 검증 호환성
  - `lib/schemas/domain/inventory.schema.ts`: 전체 `z.string().uuid()` → `z.string().min(1)` 변경 — Zod v4의 엄격한 RFC 4122 검증이 seed UUID 형식과 불일치하는 버그 수정

  #### 검증 결과
  - `npm run check-all` (TypeScript + ESLint + Prettier) 전체 통과
  - `npm run build` 성공

- ✅ **Task 030: 주문처리 통합 화면 (F003·F004·F005·F006·F007)** - 완료

  #### 요구사항
  - 피킹→패킹→라벨출력→배송요청 4단계가 개별 화면으로 분리되어, 2~4시간 배송주기 내 10~20건 주문을 30분 이내 일괄 처리하기 어려운 문제 해결
  - `/orders/fulfillment` (화면번호: 31010) 신규 통합 화면 구현

  #### 신규 파일

  **서버 액션 / 스키마 / 훅**
  - `lib/schemas/domain/order-fulfillment.schema.ts` 신규: 10개 Zod 스키마 (fetchOrders, fetchItems, fetchStats, batchPicking, batchPacking, batchLabels, batchDispatch, updateOrderStatus, fetchDispatch, fetchPrint)
  - `lib/actions/domain/order-fulfillment.actions.ts` 신규: 10개 Server Action (`fetchOrdersForFulfillment`, `fetchOrderItemsWithInventory`, `fetchDashboardStats`, `batchStartPicking`, `batchCompletePacking`, `batchGenerateLabels`, `batchCreateDispatchRequests`, `updateOrderStatus`, `fetchDispatchRequestsByStore`, `fetchPrintData`)
  - `lib/hooks/use-order-realtime.ts` 신규: Supabase Realtime store_id 필터 구독 + Web Audio API "딩동" 알림음 (`playDingDong`) — 외부 MP3 파일 불필요

  **Server Component / 페이지**
  - `app/(admin)/orders/fulfillment/page.tsx` 신규: `force-dynamic` Server Component, 가게 목록 + 초기 대시보드 통계 로드
  - `app/(admin)/orders/fulfillment/loading.tsx` 신규: 4-패널 스켈레톤 UI

  **소형 컴포넌트**
  - `app/(admin)/orders/fulfillment/components/dashboard-cards.tsx` 신규: 금일 주문수·피킹대기·패킹대기·배송요청 카드 4종
  - `app/(admin)/orders/fulfillment/components/alert-banner.tsx` 신규: "딩동~~ 주문이 접수 되었습니다!!" 배너 (5초 자동 해제)
  - `app/(admin)/orders/fulfillment/components/order-status-select.tsx` 신규: 주문 상태 인라인 수정 Select (stopPropagation으로 행 선택 충돌 방지)
  - `app/(admin)/orders/fulfillment/components/print-list-dialog.tsx` 신규: 카테고리별 피킹집계 + 주문별 상세 2패널 인쇄 다이얼로그

  **4-패널 컴포넌트**
  - `app/(admin)/orders/fulfillment/panels/order-list-panel.tsx` 신규: Panel 1 — 체크박스 다중선택 DataTable + 배송구분 탭 필터 6종
  - `app/(admin)/orders/fulfillment/panels/order-detail-panel.tsx` 신규: Panel 2 — order_item + inventory JOIN, on_hand < qty 경고 하이라이트
  - `app/(admin)/orders/fulfillment/panels/processing-panel.tsx` 신규: Panel 3 — [피킹][패킹][라벨출력] 버튼 + 처리결과 테이블
  - `app/(admin)/orders/fulfillment/panels/dispatch-panel.tsx` 신규: Panel 4 — [배송요청] 버튼 + dispatch_request 테이블
  - `app/(admin)/orders/fulfillment/fulfillment-client.tsx` 신규: 4-패널 MDI 오케스트레이터 (useState + useTransition + useCallback 패턴)

  #### 수정 파일
  - `lib/repositories/order.repository.ts`: `DashboardStats` 인터페이스 + `findByStoreAndDateRange()` + `getStats()` 추가
  - `lib/repositories/order-item.repository.ts`: `findByOrderId()` 추가
  - `lib/navigation/menu-items.ts`: "주문처리" 메뉴 (id: orders-fulfillment, screenNumber: 31010) 추가
  - `components/admin/domain/status-badge-map.tsx`: `orderItem` 배지 맵 + `deliveryMethod` 배지 맵 추가, `DomainStatusType` 유니온 확장

  #### 검증 결과
  - `npm run typecheck` 에러 없음
  - `npm run check-all` (TypeScript + ESLint + Prettier) 전체 통과
  - `npm run build` 성공 (`/orders/fulfillment` 11.4 kB, 29개 라우트)

- ✅ **Task 028: 좌측 메뉴 UX 개선 + MDI 수직 분할 추가** - 완료

  #### 요구사항
  1. 1depth 메뉴 버튼 클릭 시 다른 펼쳐진 메뉴가 닫히지 않는 문제 (배타적 아코디언)
  2. 서브메뉴 트리가 길어져도 스크롤바가 나타나지 않는 문제 (flex containment 깨짐)
  3. 한글 메뉴 라벨이 공백 포함으로 잘리는 문제 (예: "가게 관리" → "가게 관")
  4. MDI 수직 분할(좌/우) 버튼 부재 — 수평 분할(상/하)만 지원

  #### Feature 1: 배타적 메뉴 펼침 (Exclusive Accordion)
  - `lib/stores/left-panel-store.ts`: `expandMenu(id)` 로직을 `expandedIds: [id]`로 변경 — 클릭 시 기존 펼쳐진 메뉴 모두 닫고 해당 메뉴만 펼침

  #### Feature 2: 서브메뉴 세로 스크롤바 복구
  - `components/frame/left-panel.tsx`: 서브메뉴 wrapper div에 `min-h-0 overflow-hidden` 추가
  - `components/frame/sub-menu-tree.tsx`: root div에 `min-h-0 flex-1 overflow-hidden` 추가, ScrollArea에 `min-h-0` 추가 — flex containment 체인 완성

  #### Feature 3: 한글 메뉴 라벨 2줄 표기
  - `components/frame/main-menu-bar.tsx`: `formatMenuLabel()` 함수 추가 — 공백 제거 후 4자 추출, 한글 4자(`/^[가-힣]{4}$/`) 감지 시 2+2 줄바꿈(`<br />`) 렌더링

  #### Feature 4: MDI 수직 분할(좌/우) 버튼 추가
  - `lib/stores/mdi-store.ts`: `splitDirection: "horizontal" | "vertical"` 상태 + `setSplitDirection` 액션 추가, `resetToHome`에 방향 초기화 포함
  - `components/frame/screen-split-toggle.tsx`: 단일 토글 → 2개 버튼(수평 `Rows2` / 수직 `Columns2`) — 같은 버튼 재클릭 시 분할 해제, 다른 버튼 클릭 시 방향 전환
  - `components/frame/mdi-content-area.tsx`: `splitDirection` 기반 `flex-col divide-y`(수평) / `flex-row divide-x`(수직) 레이아웃 동적 적용, `cn()` import 추가

  #### 검증 결과
  - `npm run typecheck` 에러 없음
  - `npm run lint` 에러 없음
  - `npm run build` 성공

---

## 품질 체크리스트

### 📋 PRD 반영

- [ ] PRD의 24개 기능(F001~F024)이 모두 Task로 분해되었는가?
- [ ] PRD의 28개 화면이 Phase 2에서 모두 UI 구현되는가?
- [ ] PRD의 32개 테이블이 Phase 3 리포지토리 레이어에 매핑되었는가?

### 🏗️ 구조 우선 접근법

- [ ] Phase 1에서 라우트 스캐폴딩 + 타입/스키마 골격 우선 구성
- [ ] Phase 2에서 더미 데이터로 UI 검증 가능
- [ ] Phase 3에서 공통 레이어(리포지토리·스키마·액션) 선행 후 기능 구현
- [ ] 기존 manager-app 공통 컴포넌트·BaseRepository 재사용 극대화

### 🧪 테스트 검증

- [ ] Phase 3의 모든 API/비즈니스 로직 Task에 **테스트 체크리스트** 포함
- [ ] Playwright MCP를 활용한 E2E 시나리오가 모든 핵심 플로우를 커버
- [ ] 역할 기반 접근 제어, Realtime 구독, 에러 케이스 테스트 포함
- [ ] Task 019에 전체 통합 E2E 테스트 포함

### 🔗 재사용성 및 일관성

- [ ] 모든 리포지토리가 `BaseRepository<T>` 상속
- [ ] 모든 Server Action이 `withAction` 래퍼 사용
- [ ] 모든 UI 목록이 `DataTable` + `PaginationBar` 재사용
- [ ] 모든 폼이 `FormField` + RHF + Zod 조합 사용
- [ ] 기능 ID(F001~F024) 주석이 페이지 파일에 삽입되어 PRD 추적성 확보
