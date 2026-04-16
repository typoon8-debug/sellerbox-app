import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

type InventoryRow = Database["public"]["Tables"]["inventory"]["Row"];
type InventoryInsert = Database["public"]["Tables"]["inventory"]["Insert"];
type InventoryUpdate = Database["public"]["Tables"]["inventory"]["Update"];

export type InventoryWithItem = InventoryRow & {
  item: Database["public"]["Tables"]["item"]["Row"] | null;
};

export class InventoryRepository extends BaseRepository<"inventory"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "inventory", "inventory_id", "created_at");
  }

  /**
   * 특정 가게의 재고 목록을 상품 정보와 함께 조회 (카테고리/상품명 필터 지원)
   */
  async findByStoreWithItemJoin(
    storeId: string,
    filters?: { category?: string; search?: string }
  ): Promise<InventoryWithItem[]> {
    let query = this.client
      .from("inventory")
      .select("*, item(*)")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });

    if (filters?.category) {
      query = query.eq("item.item_category_name", filters.category);
    }
    if (filters?.search) {
      const kw = filters.search;
      query = query.or(`name.ilike.%${kw}%,sku.ilike.%${kw}%`, {
        referencedTable: "item",
      });
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    // 필터 적용 시 item이 null인 행(조인 불일치) 제거
    const rows = (data ?? []) as unknown as InventoryWithItem[];
    return filters?.category || filters?.search ? rows.filter((r) => r.item !== null) : rows;
  }

  /**
   * 여러 재고 레코드 일괄 생성
   */
  async createBatch(dtos: InventoryInsert[]): Promise<InventoryRow[]> {
    const { data, error } = await this.client.from("inventory").insert(dtos).select();

    if (error) throw new Error(error.message);
    return (data ?? []) as InventoryRow[];
  }

  /**
   * 여러 재고 레코드 일괄 업데이트 (on_hand, safety_stock)
   */
  async updateBatch(updates: { id: string; dto: InventoryUpdate }[]): Promise<InventoryRow[]> {
    const results = await Promise.all(updates.map(({ id, dto }) => this.update(id, dto)));
    return results;
  }

  /**
   * 특정 가게에서 이미 재고가 생성된 항목 조회 (item_id + inventory_id + status 반환)
   * - status 포함: STOP 상태 재고 재활성화 처리에 활용
   */
  async findExistingItems(
    storeId: string,
    itemIds: string[]
  ): Promise<{ item_id: string; inventory_id: string; status: string }[]> {
    const { data, error } = await this.client
      .from("inventory")
      .select("item_id, inventory_id, status")
      .eq("store_id", storeId)
      .in("item_id", itemIds);

    if (error) throw new Error(error.message);
    return (data ?? []) as { item_id: string; inventory_id: string; status: string }[];
  }
}
