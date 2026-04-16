import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

type SellerRow = Database["public"]["Tables"]["seller"]["Row"];

export class SellerRepository extends BaseRepository<"seller"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "seller", "seller_id", "created_at");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected override applySearch(query: any, search: string): any {
    return query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  /** 이메일로 활성 seller 목록 조회 (OWNER는 여러 가게 운영 가능 → 복수 레코드) */
  async findByEmail(email: string): Promise<SellerRow[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from("seller")
      .select("*")
      .eq("email", email)
      .eq("is_active", "ACTIVE");

    if (error) throw new Error(error.message);
    return (data ?? []) as SellerRow[];
  }
}
