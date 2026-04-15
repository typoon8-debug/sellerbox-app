import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

type PickingTaskRow = Database["public"]["Tables"]["picking_task"]["Row"];

export class PickingTaskRepository extends BaseRepository<"picking_task"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "picking_task", "task_id", "created_at");
  }

  /**
   * 특정 피커의 진행 중인 피킹 작업 조회
   */
  async findActiveByPicker(pickerId: string): Promise<PickingTaskRow[]> {
    const { data, error } = await this.client
      .from("picking_task")
      .select("*")
      .eq("picker_id", pickerId)
      .in("status", ["CREATED", "PICKING"])
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as PickingTaskRow[];
  }
}
