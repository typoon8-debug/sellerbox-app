import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

type InventoryTxnRow = Database["public"]["Tables"]["inventory_txn"]["Row"];

export class InventoryTxnRepository extends BaseRepository<"inventory_txn"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "inventory_txn", "txnId", "created_at");
  }

  /**
   * 특정 재고의 트랜잭션 이력 조회 (최신순)
   */
  async findByInventoryId(inventoryId: string): Promise<InventoryTxnRow[]> {
    const { data, error } = await this.client
      .from("inventory_txn")
      .select("*")
      .eq("inventory_id", inventoryId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as InventoryTxnRow[];
  }
}
