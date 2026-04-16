import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

type UserRow = Database["public"]["Tables"]["users"]["Row"];

export class UserRepository extends BaseRepository<"users"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "users", "user_id");
  }

  /**
   * Supabase auth user id로 ADMIN 역할의 활성 사용자 조회
   * app/_actions/_utils.ts의 assertAdminSession에서 사용
   */
  async findAdminByAuthUserId(authUserId: string): Promise<UserRow | null> {
    const { data, error } = await this.client
      .from("users")
      .select("*")
      .eq("auth_user_id", authUserId)
      .eq("role", "ADMIN")
      .eq("active", true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }
}
