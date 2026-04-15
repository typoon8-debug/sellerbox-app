import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

type InventoryWithItem = Database["public"]["Tables"]["inventory"]["Row"] & {
  item: Database["public"]["Tables"]["item"]["Row"] | null;
};

export class InventoryRepository extends BaseRepository<"inventory"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "inventory", "inventory_id", "created_at");
  }

  /**
   * 특정 가게의 재고 목록을 상품 정보와 함께 조회
   */
  async findByStoreWithItemJoin(storeId: string): Promise<InventoryWithItem[]> {
    const { data, error } = await this.client
      .from("inventory")
      .select("*, item(*)")
      .eq("store_id", storeId);

    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as InventoryWithItem[];
  }
}
