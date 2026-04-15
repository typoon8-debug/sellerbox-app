import type { ApiError } from "@/lib/types/api";

// ---------------------------------------------------------------------------
// 에러 클래스
// ---------------------------------------------------------------------------

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super("VALIDATION_ERROR", message, details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "리소스를 찾을 수 없습니다.") {
    super("NOT_FOUND", message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "로그인이 필요합니다.") {
    super("UNAUTHORIZED", message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "접근 권한이 없습니다.") {
    super("FORBIDDEN", message);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super("CONFLICT", message, details);
    this.name = "ConflictError";
  }
}

// ---------------------------------------------------------------------------
// 에러 직렬화 유틸
// ---------------------------------------------------------------------------

export function toApiError(err: unknown): ApiError {
  if (err instanceof AppError) {
    return {
      code: err.code,
      message: err.message,
      details: err.details,
    };
  }

  if (err instanceof Error) {
    // Supabase PostgreSQL unique 위반 처리
    if (err.message.includes("duplicate key") || err.message.includes("unique constraint")) {
      return { code: "CONFLICT", message: "이미 존재하는 값입니다." };
    }
    return { code: "INTERNAL_ERROR", message: err.message };
  }

  return { code: "UNKNOWN_ERROR", message: "알 수 없는 오류가 발생했습니다." };
}
