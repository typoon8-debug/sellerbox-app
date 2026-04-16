import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

type ItemDetailRow = Database["public"]["Tables"]["item_detail"]["Row"];

export class ItemDetailRepository extends BaseRepository<"item_detail"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "item_detail", "item_detail_id", "created_at");
  }

  /** 상품 ID로 활성 상세 정보 조회 */
  async findByItemId(itemId: string): Promise<ItemDetailRow[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from("item_detail")
      .select("*")
      .eq("item_id", itemId)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as ItemDetailRow[];
  }

  /** 소프트 삭제: status를 INACTIVE로 변경 */
  async softDelete(itemDetailId: string): Promise<ItemDetailRow> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from("item_detail")
      .update({ status: "INACTIVE" })
      .eq("item_detail_id", itemDetailId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as ItemDetailRow;
  }

  /** description_short ILIKE 검색 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected override applySearch(query: any, search: string): any {
    return query.ilike("description_short", `%${search}%`);
  }
}
