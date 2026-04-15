import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

type PickingItemRow = Database["public"]["Tables"]["picking_item"]["Row"];

export class PickingItemRepository extends BaseRepository<"picking_item"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "picking_item", "picking_item_id", "picking_item_id");
  }

  /**
   * 특정 피킹 작업의 모든 항목 조회
   */
  async findByTaskId(taskId: string): Promise<PickingItemRow[]> {
    const { data, error } = await this.client
      .from("picking_item")
      .select("*")
      .eq("task_id", taskId);

    if (error) throw new Error(error.message);
    return (data ?? []) as PickingItemRow[];
  }
}
