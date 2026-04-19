"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type UserProfile = {
  userId: string;
  email: string;
  name: string;
  phone: string | null;
  role: "CUSTOMER" | "SELLER" | "RIDER" | "ADMIN";
};

/** 현재 로그인 사용자의 프로필을 users 테이블에서 조회 */
export async function getMyProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("user_id, email, name, phone, role")
    .eq("auth_user_id", user.id)
    .single();

  if (error || !data) return null;

  return {
    userId: data.user_id,
    email: data.email,
    name: data.name,
    phone: data.phone,
    role: data.role as UserProfile["role"],
  };
}

/** 현재 사용자의 이름·전화번호를 수정, 비밀번호는 입력된 경우에만 변경 */
export async function updateMyProfile(values: {
  name: string;
  phone?: string | null;
  password?: string;
}): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "인증 정보가 없습니다." };

  // users 테이블 업데이트 (name, phone)
  const { error: dbError } = await supabase
    .from("users")
    .update({
      name: values.name,
      phone: values.phone ?? null,
    })
    .eq("auth_user_id", user.id);

  if (dbError) return { success: false, message: "정보 저장에 실패했습니다." };

  // 비밀번호 변경 요청이 있는 경우
  if (values.password && values.password.length >= 8) {
    const { error: pwError } = await supabase.auth.updateUser({
      password: values.password,
    });
    if (pwError) return { success: false, message: "비밀번호 변경에 실패했습니다." };
  }

  revalidatePath("/", "layout");
  return { success: true, message: "내 정보가 저장되었습니다." };
}
