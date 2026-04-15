import type { Database } from "@/lib/supabase/database.types";

// ─── 피킹 작업 ────────────────────────────────────────────────────────────────
export type PickingTaskRow = Database["public"]["Tables"]["picking_task"]["Row"];
export type PickingTaskInsert = Database["public"]["Tables"]["picking_task"]["Insert"];
export type PickingTaskUpdate = Database["public"]["Tables"]["picking_task"]["Update"];

// ─── 피킹 상품 ────────────────────────────────────────────────────────────────
export type PickingItemRow = Database["public"]["Tables"]["picking_item"]["Row"];
export type PickingItemInsert = Database["public"]["Tables"]["picking_item"]["Insert"];
export type PickingItemUpdate = Database["public"]["Tables"]["picking_item"]["Update"];

// ─── 패킹 작업 ────────────────────────────────────────────────────────────────
export type PackingTaskRow = Database["public"]["Tables"]["packing_task"]["Row"];
export type PackingTaskInsert = Database["public"]["Tables"]["packing_task"]["Insert"];
export type PackingTaskUpdate = Database["public"]["Tables"]["packing_task"]["Update"];

// ─── 라벨 ─────────────────────────────────────────────────────────────────────
export type LabelRow = Database["public"]["Tables"]["label"]["Row"];
export type LabelInsert = Database["public"]["Tables"]["label"]["Insert"];
export type LabelUpdate = Database["public"]["Tables"]["label"]["Update"];
