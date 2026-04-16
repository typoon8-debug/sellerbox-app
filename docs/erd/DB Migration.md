❯ supabase 리전을 싱가포르에서 서울로 변경하려고 해.                                                                  
  서울리전에 supabase 프로젝트를 생성하고 seller-app에서 생성한 싱가포르 supabase DB를 서울리전 supabase DB로         
  이관하는 방법을 분석해서 계획해줘.                                                                                  

● Explore(Supabase 프로젝트 구조 분석)
  ⎿  Done (28 tool uses · 72.9k tokens · 1m 48s)
  (ctrl+o to expand)

● 분석이 완료되었습니다. 이제 서울 리전 이관 계획을 수립하겠습니다.

  ---
  Supabase 싱가포르 → 서울 리전 이관 계획

  현재 상태 요약

  ┌───────────────────┬──────────────────────────────────────┐
  │       항목        │                 현황                 │
  ├───────────────────┼──────────────────────────────────────┤
  │ 현재 프로젝트 ID  │ [싱가포르 프로젝트 ID]               │
  ├───────────────────┼──────────────────────────────────────┤
  │ 테이블 수         │ 35개                                 │
  ├───────────────────┼──────────────────────────────────────┤
  │ 마이그레이션 파일 │ 7개                                  │
  ├───────────────────┼──────────────────────────────────────┤
  │ RLS 정책          │ 26개                                 │
  ├───────────────────┼──────────────────────────────────────┤
  │ Storage 버킷      │ item-images                          │
  ├───────────────────┼──────────────────────────────────────┤
  │ Auth 사용자       │ (관리자 계정)                        │
  └───────────────────┴──────────────────────────────────────┘

  ---
  이관 전략 선택

  Supabase는 공식적으로 리전 간 프로젝트 이전 기능을 제공하지 않습니다. 새 프로젝트를 서울에 생성 후 수동 이관이
  필요합니다.

  추천 방식: pg_dump + pg_restore + 마이그레이션 파일 활용

  ---
  단계별 이관 계획

  Phase 1. 사전 준비 (로컬)

  # 1. Supabase CLI 최신 버전 확인
  supabase --version

  # 2. PostgreSQL 클라이언트 도구 설치 확인 (pg_dump, psql)
  pg_dump --version

  # 3. 싱가포르 DB 연결 정보 확인
  # Supabase 대시보드 → Project Settings → Database
  # (연결 정보는 .env.local에 보관하고 코드에 포함하지 않음)

  싱가포르 프로젝트의 다음 정보 메모:
    - Project ID: [Supabase 대시보드에서 확인]
    - API URL: [Supabase 대시보드에서 확인]
    - Anon Key: [REDACTED — .env.local 참조]
    - Service Role Key: [REDACTED — .env.local 참조]
    - DB 연결 정보 (Host, Password): [REDACTED — .env.local 참조]

  Publishable key: [REDACTED — .env.local 참조]
  Secret key: [REDACTED — .env.local 참조]

  # Host, Port, Database, User, Password 메모




  체크포인트
  - Supabase CLI 설치됨
  - psql / pg_dump 설치됨 (PostgreSQL 15+)
  - 싱가포르 프로젝트 DB 연결 정보 확보

  ---
  Phase 2. 서울 리전 신규 프로젝트 생성

  1. https://supabase.com/dashboard 접속
  2. New Project 클릭
  3. 설정:
    - Name: freshpick
    - Database Password: [.env.local 참조]
    - Region: Northeast Asia (Seoul) ← 핵심
  4. 프로젝트 생성 완료까지 대기 (약 1-2분)
  5. 새 프로젝트의 다음 정보 메모:
    - Project ID: [Supabase 대시보드에서 확인]
    - API URL: [Supabase 대시보드에서 확인]
    - Anon Key: [REDACTED — .env.local 참조]
    - Service Role Key: [REDACTED — .env.local 참조]
    - DB 연결 정보 (Host, Password): [REDACTED — .env.local 참조]

  Publishable key: [REDACTED — .env.local 참조]
  Secret key: [REDACTED — .env.local 참조]

  ---
  Phase 3. 스키마 마이그레이션 (마이그레이션 파일 적용)

  # 방법 A: Supabase CLI로 마이그레이션 적용 (권장)
  # 새 프로젝트 ID로 연결
  supabase link --project-ref <새_서울_프로젝트_ID>

  # 마이그레이션 파일 순서대로 적용
  supabase db push

  # 방법 B: all_migrations_combined.sql 직접 실행
  psql "postgresql://postgres:<DB_PASSWORD>@<서울_HOST>:5432/postgres" \
    -f supabase/migrations/all_migrations_combined.sql

  적용 순서 (의존성 순서 준수)
  1. 20260416000001_core_identity.sql - 기본 테이블
  2. 20260416000002_catalog_inventory.sql - 상품/재고
  3. 20260416000003_orders_fulfillment.sql - 주문/배송
  4. 20260416000004_promotion_coupon.sql - 프로모션
  5. 20260416000005_ads_support.sql - 광고/CS
  6. 20260416000006_rls_policies.sql - RLS 정책
  7. 20260416000007_storage_buckets.sql - Storage 버킷

  ---
  Phase 4. 데이터 이관 (pg_dump → pg_restore)

  # 1. 싱가포르 DB에서 데이터 덤프
  # Supabase 대시보드 → Project Settings → Database → Connection string 확인
  pg_dump \
    --host=<싱가포르_DB_HOST> \
    --port=5432 \
    --username=postgres \
    --dbname=postgres \
    --no-owner \
    --no-acl \
    --data-only \           # 스키마는 이미 적용했으므로 데이터만
    --format=custom \
    --file=sellerbox_backup.dump

  # 2. 서울 DB에 복원
  pg_restore \
    --host=<서울_DB_HOST> \
    --port=5432 \
    --username=postgres \
    --dbname=postgres \
    --no-owner \
    --no-acl \
    --data-only \
    sellerbox_backup.dump

  ▎ 주의: Supabase DB 비밀번호는 프로젝트 생성 시 설정한 값 사용

  ---
  Phase 5. Auth 사용자 이관

  Auth 사용자는 pg_dump에 포함되지 않을 수 있습니다. 별도 처리 필요:

  # auth 스키마 포함 덤프
  pg_dump \
    --host=<싱가포르_DB_HOST> \
    --port=5432 \
    --username=postgres \
    --dbname=postgres \
    --schema=auth \
    --data-only \
    --format=custom \
    --file=sellerbox_auth_backup.dump

  # 서울 DB에 auth 복원
  pg_restore \
    --host=<서울_DB_HOST> \
    --port=5432 \
    --username=postgres \
    --dbname=postgres \
    --schema=auth \
    --data-only \
    sellerbox_auth_backup.dump

  ▎ 대안: 사용자 수가 적다면 Supabase 대시보드에서 수동으로 초대 후 재가입 처리

  ---
  Phase 6. Storage 파일 이관

  # Supabase CLI로 Storage 버킷 간 파일 이전
  # 또는 rclone 같은 도구 활용

  # 방법: rclone 사용
  rclone copy \
    "supabase-sg:item-images" \
    "supabase-seoul:item-images"

  # 방법: 직접 스크립트 (Node.js)
  # 싱가포르에서 파일 목록 조회 후 서울로 재업로드

  ▎ 현재 이미지가 많지 않다면 수동 재업로드도 현실적

  ---
  Phase 7. 환경 변수 업데이트

  # .env.local 수정
  NEXT_PUBLIC_SUPABASE_URL=https://<새_서울_프로젝트_ID>.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<서울_ANON_KEY>
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<서울_ANON_KEY>
  SUPABASE_SERVICE_ROLE_KEY=<서울_SERVICE_ROLE_KEY>

  # supabase CLI 재연결
  supabase link --project-ref <서울_프로젝트_ID>

  # TypeScript 타입 재생성
  npm run db:types

  ---
  Phase 8. 검증 및 테스트

  # 1. 개발 서버 실행
  npm run dev

  # 2. 전체 검사
  npm run check-all

  # 3. 빌드 확인
  npm run build

  검증 체크리스트
  - 로그인 동작 확인
  - 상품 목록 조회
  - 이미지 업로드/표시
  - 주문 생성/조회
  - RLS 정책 동작 확인

  ---
  Phase 9. (필요시) 싱가포르 프로젝트 삭제

  이관 완료 및 검증 후 싱가포르 프로젝트 삭제

  ---
  이관 전략 요약

  ┌──────────────────┬─────────────────────────────────────────────────────┐
  │    위험 요소     │                      대응 방법                      │
  ├──────────────────┼─────────────────────────────────────────────────────┤
  │ 데이터 손실      │ 이관 전 반드시 전체 pg_dump 백업                    │
  ├──────────────────┼─────────────────────────────────────────────────────┤
  │ Auth JWT 시크릿  │ 새 프로젝트는 다른 JWT 시크릿 → 기존 토큰 무효화    │
  ├──────────────────┼─────────────────────────────────────────────────────┤
  │ Storage URL 변경 │ 이미지 URL이 변경됨 → DB에 저장된 URL 업데이트 필요 │
  ├──────────────────┼─────────────────────────────────────────────────────┤
  │ 다운타임         │ 이관 중 짧은 서비스 중단 발생                       │
  ├──────────────────┼─────────────────────────────────────────────────────┤
  │ RLS 정책         │ pg_dump 시 포함 여부 확인                           │
  └──────────────────┴─────────────────────────────────────────────────────┘

  ---
  이관 작업 순서 요약

  1. 사전 준비 (도구 설치, 연결 정보 수집)
        ↓
  2. 서울 리전 신규 프로젝트 생성
        ↓
  3. 마이그레이션 파일로 스키마 적용
        ↓
  4. pg_dump으로 데이터 이관
        ↓
  5. Auth 사용자 이관
        ↓
  6. Storage 파일 이관
        ↓
  7. 환경 변수 업데이트 + TypeScript 타입 재생성
        ↓
  8. 검증 및 테스트
        ↓
  9. (필요시) 싱가포르 프로젝트 삭제

  ---
  진행할 준비가 되면 어떤 단계부터 시작할지 알려주세요. 각 단계별로 구체적인 명령어나 코드를 도와드릴 수 있습니다.
