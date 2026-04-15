import type { Database } from "@/lib/supabase/database.types";

// ─── 주문 ─────────────────────────────────────────────────────────────────────
export type OrderRow = Database["public"]["Tables"]["order"]["Row"];
export type OrderInsert = Database["public"]["Tables"]["order"]["Insert"];
export type OrderUpdate = Database["public"]["Tables"]["order"]["Update"];

// ─── 주문 상품 ────────────────────────────────────────────────────────────────
export type OrderItemRow = Database["public"]["Tables"]["order_item"]["Row"];
export type OrderItemInsert = Database["public"]["Tables"]["order_item"]["Insert"];
export type OrderItemUpdate = Database["public"]["Tables"]["order_item"]["Update"];
