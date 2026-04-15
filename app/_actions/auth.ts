"use server";

import type { ApiResponse } from "@/lib/types/api";
import { createClient } from "@/lib/supabase/server";
import { toApiError, UnauthorizedError } from "@/lib/errors";

/**
 * 이메일/비밀번호 로그인
 */
export async function loginAction(credentials: {
  email: string;
  password: string;
}): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new UnauthorizedError("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    return { ok: true, data: null };
  } catch (err) {
    return { ok: false, error: toApiError(err) };
  }
}

/**
 * 관리자 비밀번호 재확인 (민감 작업 전 2차 검증)
 */
export async function verifyAdminPassword(password: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      throw new UnauthorizedError("로그인이 필요합니다.");
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (error) {
      throw new UnauthorizedError("비밀번호가 올바르지 않습니다.");
    }

    return { ok: true, data: null };
  } catch (err) {
    return { ok: false, error: toApiError(err) };
  }
}
