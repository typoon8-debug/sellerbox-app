import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";
import type { CsTicketWithJoins } from "@/lib/types/domain/support";

export class CsTicketRepository extends BaseRepository<"cs_ticket"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "cs_ticket", "ticket_id", "created_at");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected override applySearch(query: any, search: string): any {
    return query.or(`cs_contents.ilike.%${search}%`);
  }

  // cs_ticket에 store_id가 없으므로 order 경유 2단계 쿼리로 가게 스코프 처리
  async findByStoreAndDateRange(
    storeId: string,
    from: string,
    to: string,
    opts?: { status?: "OPEN" | "IN_PROGRESS" | "CLOSED" | "ALL" }
  ): Promise<CsTicketWithJoins[]> {
    const supabase = this.client;

    // 1단계: 해당 가게의 주문 목록 + order_item 조회 (기간: 주문 일자 기준)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: orders, error: orderError } = await (supabase as any)
      .from("order")
      .select("order_id, store_id, ordered_at, order_item(qty, item:item_id(name))")
      .eq("store_id", storeId)
      .gte("ordered_at", `${from}T00:00:00`)
      .lte("ordered_at", `${to}T23:59:59`);

    if (orderError) throw new Error(orderError.message);
    if (!orders || orders.length === 0) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderMap = new Map<string, any>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (orders as any[]).map((o: any) => [o.order_id, o])
    );
    const orderIds = Array.from(orderMap.keys());

    // 2단계: cs_ticket을 해당 order_ids + 기간 필터로 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ticketQuery = (supabase as any)
      .from("cs_ticket")
      .select("*")
      .in("order_id", orderIds)
      .order("created_at", { ascending: false });

    if (opts?.status && opts.status !== "ALL") {
      ticketQuery = ticketQuery.eq("status", opts.status);
    }

    const { data: tickets, error } = await ticketQuery;
    if (error) throw new Error(error.message);
    if (!tickets || tickets.length === 0) return [];

    // 3단계: 회원 정보 조회
    const customerIds = [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...new Set((tickets as any[]).map((t: any) => t.customer_id as string)),
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: customers } = await (supabase as any)
      .from("users")
      .select("user_id, email")
      .in("user_id", customerIds);

    const customerMap = new Map<string, { user_id: string; email: string }>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((customers ?? []) as any[]).map((c: any) => [c.user_id, c])
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (tickets as any[]).map((t: any) => ({
      ...t,
      order: orderMap.get(t.order_id) ?? null,
      customer: customerMap.get(t.customer_id) ?? null,
    })) as CsTicketWithJoins[];
  }

  async countOpenByStore(storeId: string, from: string, to: string): Promise<number> {
    const supabase = this.client;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: orders } = await (supabase as any)
      .from("order")
      .select("order_id")
      .eq("store_id", storeId)
      .gte("ordered_at", `${from}T00:00:00`)
      .lte("ordered_at", `${to}T23:59:59`);

    if (!orders || orders.length === 0) return 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderIds = (orders as any[]).map((o: any) => o.order_id as string);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error } = await (supabase as any)
      .from("cs_ticket")
      .select("ticket_id", { count: "exact", head: true })
      .in("order_id", orderIds)
      .eq("status", "OPEN");

    if (error) throw new Error(error.message);
    return count ?? 0;
  }
}
