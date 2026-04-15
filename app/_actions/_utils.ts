import type { ZodSchema } from "zod";
import type { ApiResponse } from "@/lib/types/api";
import type { AuditMeta } from "@/lib/types/audit";
import type { Json } from "@/lib/supabase/database.types";
import {
  AppError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
  toApiError,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserRepository } from "@/lib/repositories/user";

// ---------------------------------------------------------------------------
// 인증 컨텍스트
// ---------------------------------------------------------------------------

export interface AdminContext {
  authUserId: string;
  adminUserId: string;
}

/**
 * 현재 세션이 관리자인지 검증하고 컨텍스트를 반환
 * - auth.getUser()로 인증 확인
 * - users 테이블에서 ADMIN role + active 확인
 */
export async function assertAdminSession(): Promise<AdminContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError("로그인이 필요합니다.");
  }

  // Service Role 클라이언트로 domain users 테이블 조회 (RLS bypass)
  const adminClient = createAdminClient();
  const userRepo = new UserRepository(adminClient);
  const adminProfile = await userRepo.findAdminByAuthUserId(user.id);

  if (!adminProfile) {
    throw new ForbiddenError("관리자 계정이 아닙니다.");
  }

  return { authUserId: user.id, adminUserId: adminProfile.user_id };
}

// ---------------------------------------------------------------------------
// 감사 로그 기록 헬퍼 (내부 전용)
// ---------------------------------------------------------------------------

async function insertAuditLog(adminUserId: string, meta: AuditMeta): Promise<void> {
  try {
    const adminClient = createAdminClient();
    await adminClient.from("audit_log").insert({
      user_id: adminUserId,
      action: meta.action,
      resource: meta.resource,
      payload: (meta.payload ?? null) as Json | null,
    });
  } catch (err) {
    // 감사 로그 실패는 원본 응답에 영향 없음
    console.warn("[audit_log] INSERT 실패:", err);
  }
}

// ---------------------------------------------------------------------------
// Server Action 공통 래퍼
// ---------------------------------------------------------------------------

/**
 * Zod 파싱 + 인증 검증 + 에러 직렬화 + 감사 로그를 공통 처리
 *
 * @param audit - 핸들러 성공 시 자동 기록할 감사 메타 (선택)
 *
 * @example
 * const result = await withAction(
 *   createTenantSchema,
 *   async (input, ctx) => TenantRepository.create(input),
 *   { action: "CREATE", resource: "TENANT" }
 * )(rawInput);
 */
export function withAction<TInput, TOutput>(
  schema: ZodSchema<TInput>,
  handler: (input: TInput, ctx: AdminContext) => Promise<TOutput>,
  audit?: AuditMeta
): (rawInput: unknown) => Promise<ApiResponse<TOutput>> {
  return async (rawInput: unknown): Promise<ApiResponse<TOutput>> => {
    try {
      // 1. Zod 파싱
      const parsed = schema.safeParse(rawInput);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.issues.map((e) => e.message).join(", "),
          parsed.error.flatten().fieldErrors
        );
      }

      // 2. 관리자 인증 확인
      const ctx = await assertAdminSession();

      // 3. 핸들러 실행
      const data = await handler(parsed.data, ctx);

      // 4. 감사 로그 기록 (성공 시)
      if (audit) {
        await insertAuditLog(ctx.adminUserId, audit);
      }

      return { ok: true, data };
    } catch (err) {
      if (err instanceof AppError) {
        return { ok: false, error: toApiError(err) };
      }
      return { ok: false, error: toApiError(err) };
    }
  };
}

/**
 * 감사 로그를 직접 기록하는 헬퍼 (withAction 미사용 액션에서 호출)
 * try-catch 액션의 성공 분기에서 사용
 */
export async function recordAudit(adminUserId: string, meta: AuditMeta): Promise<void> {
  await insertAuditLog(adminUserId, meta);
}
