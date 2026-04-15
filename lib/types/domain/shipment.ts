import type { Database } from "@/lib/supabase/database.types";

// ─── 배송 ─────────────────────────────────────────────────────────────────────
export type ShipmentRow = Database["public"]["Tables"]["shipment"]["Row"];
export type ShipmentInsert = Database["public"]["Tables"]["shipment"]["Insert"];
export type ShipmentUpdate = Database["public"]["Tables"]["shipment"]["Update"];

// ─── 배송 이벤트 ──────────────────────────────────────────────────────────────
export type ShipmentEventRow = Database["public"]["Tables"]["shipment_event"]["Row"];
export type ShipmentEventInsert = Database["public"]["Tables"]["shipment_event"]["Insert"];
export type ShipmentEventUpdate = Database["public"]["Tables"]["shipment_event"]["Update"];

// ─── 배송 요청 ────────────────────────────────────────────────────────────────
export type DispatchRequestRow = Database["public"]["Tables"]["dispatch_request"]["Row"];
export type DispatchRequestInsert = Database["public"]["Tables"]["dispatch_request"]["Insert"];
export type DispatchRequestUpdate = Database["public"]["Tables"]["dispatch_request"]["Update"];

// ─── 바로퀵 정책 ──────────────────────────────────────────────────────────────
export type StoreQuickPolicyRow = Database["public"]["Tables"]["store_quick_policy"]["Row"];
export type StoreQuickPolicyInsert = Database["public"]["Tables"]["store_quick_policy"]["Insert"];
export type StoreQuickPolicyUpdate = Database["public"]["Tables"]["store_quick_policy"]["Update"];

// ─── 바로퀵 타임슬롯 ──────────────────────────────────────────────────────────
export type StoreQuickTimeslotRow = Database["public"]["Tables"]["store_quick_timeslot"]["Row"];
export type StoreQuickTimeslotInsert =
  Database["public"]["Tables"]["store_quick_timeslot"]["Insert"];
export type StoreQuickTimeslotUpdate =
  Database["public"]["Tables"]["store_quick_timeslot"]["Update"];

// ─── 바로퀵 슬롯 사용량 ───────────────────────────────────────────────────────
export type StoreQuickSlotUsageRow = Database["public"]["Tables"]["store_quick_slot_usage"]["Row"];
export type StoreQuickSlotUsageInsert =
  Database["public"]["Tables"]["store_quick_slot_usage"]["Insert"];
export type StoreQuickSlotUsageUpdate =
  Database["public"]["Tables"]["store_quick_slot_usage"]["Update"];
