import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { BaseRepository } from "@/lib/repositories/base";

type ShipmentRow = Database["public"]["Tables"]["shipment"]["Row"];

export interface ShipmentWithOrder extends ShipmentRow {
  order: {
    order_id: string;
    ordered_at: string | null;
    delivery_method: string | null;
    address_id: string | null;
    final_payable: number | null;
  } | null;
}

export interface BbqAddressGroup {
  address_id: string;
  orders: {
    shipment_id: string;
    order_id: string;
    ordered_at: string | null;
    quick_depart_date: string | null;
    quick_depart_time: string | null;
    items: { name: string; qty: number }[];
  }[];
}

export class ShipmentRepository extends BaseRepository<"shipment"> {
  constructor(client: SupabaseClient<Database>) {
    super(client, "shipment", "shipment_id", "updated_at");
  }

  /** 가게 + 주문일자 범위로 shipment 목록 조회 (order 조인 포함) */
  async findByStoreAndDateRange(
    storeId: string,
    from: string,
    to: string
  ): Promise<ShipmentWithOrder[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from("shipment")
      .select(
        `
        *,
        order:order_id (
          order_id,
          ordered_at,
          delivery_method,
          address_id,
          final_payable
        )
        `
      )
      .eq("store_id", storeId)
      .gte("order.ordered_at", `${from}T00:00:00`)
      .lte("order.ordered_at", `${to}T23:59:59`)
      .order("updated_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as ShipmentWithOrder[];
  }

  /** BBQ 배송건을 address_id별로 그룹화하여 반환 */
  async findBbqGroupedByAddress(
    storeId: string,
    from: string,
    to: string
  ): Promise<BbqAddressGroup[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.client as any)
      .from("shipment")
      .select(
        `
        shipment_id,
        depart_date,
        depart_time,
        order:order_id (
          order_id,
          ordered_at,
          delivery_method,
          address_id,
          order_item (
            qty,
            item:item_id ( name )
          )
        )
        `
      )
      .eq("store_id", storeId)
      .gte("order.ordered_at", `${from}T00:00:00`)
      .lte("order.ordered_at", `${to}T23:59:59`);

    if (error) throw new Error(error.message);

    // BBQ 주문만 필터링 후 address_id별 그룹화 (애플리케이션 레벨)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bbqRows = (data ?? []).filter((row: any) => row.order?.delivery_method === "BBQ");

    const groupMap = new Map<string, BbqAddressGroup>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const row of bbqRows as any[]) {
      const addressId: string = row.order?.address_id ?? "UNKNOWN";
      if (!groupMap.has(addressId)) {
        groupMap.set(addressId, { address_id: addressId, orders: [] });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items = (row.order?.order_item ?? []).map((oi: any) => ({
        name: oi.item?.name ?? "-",
        qty: oi.qty ?? 0,
      }));

      groupMap.get(addressId)!.orders.push({
        shipment_id: row.shipment_id,
        order_id: row.order?.order_id ?? "",
        ordered_at: row.order?.ordered_at ?? null,
        quick_depart_date: row.depart_date ?? null,
        quick_depart_time: row.depart_time ?? null,
        items,
      });
    }

    return Array.from(groupMap.values());
  }

  /** 배송 출발 처리 (OUT_FOR_DELIVERY + shipment_event 기록) */
  async startDelivery(shipmentId: string, riderId: string): Promise<void> {
    const now = new Date();
    const departDate = now.toISOString().split("T")[0];
    const departTime = now.toTimeString().split(" ")[0]; // HH:MM:SS

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = this.client as any;

    const { error: updateError } = await supabase
      .from("shipment")
      .update({
        status: "OUT_FOR_DELIVERY",
        depart_date: departDate,
        depart_time: departTime,
        rider_id: riderId,
        updated_at: now.toISOString(),
      })
      .eq("shipment_id", shipmentId);

    if (updateError) throw new Error(updateError.message);

    const { error: eventError } = await supabase.from("shipment_event").insert({
      shipment_id: shipmentId,
      event_code: "OUT",
    });

    if (eventError) throw new Error(eventError.message);
  }

  /** 배송 완료 처리 (DELIVERED + shipment_event 기록) */
  async completeDelivery(shipmentId: string, riderId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = this.client as any;

    const { error: updateError } = await supabase
      .from("shipment")
      .update({
        status: "DELIVERED",
        rider_id: riderId,
        updated_at: new Date().toISOString(),
      })
      .eq("shipment_id", shipmentId);

    if (updateError) throw new Error(updateError.message);

    const { error: eventError } = await supabase.from("shipment_event").insert({
      shipment_id: shipmentId,
      event_code: "ARRIVED",
    });

    if (eventError) throw new Error(eventError.message);
  }
}
