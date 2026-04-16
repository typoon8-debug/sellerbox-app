import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

type OrderRow = Database["public"]["Tables"]["order"]["Row"];

export interface DashboardStats {
  todayOrderCount: number;
  pickingPendingCount: number;
  packingPendingCount: number;
  dispatchedCount: number;
}

export class OrderRepository extends BaseRepository<"order"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "order", "order_id", "ordered_at");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected override applySearch(query: any, search: string): any {
    return query.or(`order_no.ilike.%${search}%`);
  }

  /** 가게 + 날짜범위로 주문 조회 (피킹/패킹 작업용) */
  async findByStoreAndDateRange(
    storeId: string,
    from: string,
    to: string,
    deliveryFilter?: string
  ): Promise<OrderRow[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (this.client as any)
      .from("order")
      .select("*")
      .eq("store_id", storeId)
      .gte("ordered_at", `${from}T00:00:00`)
      .lte("ordered_at", `${to}T23:59:59`)
      .order("ordered_at", { ascending: false });

    if (deliveryFilter && deliveryFilter !== "ALL") {
      query = query.eq("delivery_method", deliveryFilter);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as OrderRow[];
  }

  /** 대시보드 통계 조회 (금일 기준) */
  async getStats(storeId: string, date: string): Promise<DashboardStats> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = this.client as any;

    // 금일 전체 주문 수
    const { count: todayOrderCount } = await supabase
      .from("order")
      .select("order_id", { count: "exact", head: true })
      .eq("store_id", storeId)
      .gte("ordered_at", `${date}T00:00:00`)
      .lte("ordered_at", `${date}T23:59:59`);

    // 피킹 대기 (PAID 상태 = 피킹 전)
    const { count: pickingPendingCount } = await supabase
      .from("order")
      .select("order_id", { count: "exact", head: true })
      .eq("store_id", storeId)
      .eq("status", "PAID")
      .gte("ordered_at", `${date}T00:00:00`)
      .lte("ordered_at", `${date}T23:59:59`);

    // 패킹 대기 (PACKING 상태 = 피킹 완료, 패킹 전)
    const { count: packingPendingCount } = await supabase
      .from("order")
      .select("order_id", { count: "exact", head: true })
      .eq("store_id", storeId)
      .eq("status", "PACKING")
      .gte("ordered_at", `${date}T00:00:00`)
      .lte("ordered_at", `${date}T23:59:59`);

    // 배송요청 완료 (DISPATCHED 이상)
    const { count: dispatchedCount } = await supabase
      .from("order")
      .select("order_id", { count: "exact", head: true })
      .eq("store_id", storeId)
      .in("status", ["DISPATCHED", "DELIVERING", "DELIVERED"])
      .gte("ordered_at", `${date}T00:00:00`)
      .lte("ordered_at", `${date}T23:59:59`);

    return {
      todayOrderCount: todayOrderCount ?? 0,
      pickingPendingCount: pickingPendingCount ?? 0,
      packingPendingCount: packingPendingCount ?? 0,
      dispatchedCount: dispatchedCount ?? 0,
    };
  }
}
