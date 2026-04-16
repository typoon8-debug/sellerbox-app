import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

type OrderItemRow = Database["public"]["Tables"]["order_item"]["Row"];

export class OrderItemRepository extends BaseRepository<"order_item"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "order_item", "order_detail_id", "created_at");
  }

  /** 주문 ID로 주문 아이템 목록 조회 */
  async findByOrderId(orderId: string): Promise<OrderItemRow[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from("order_item")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as OrderItemRow[];
  }
}
