import type { Database } from "@/lib/supabase/database.types";

// ─── 상품 ─────────────────────────────────────────────────────────────────────
export type ItemRow = Database["public"]["Tables"]["item"]["Row"];
export type ItemInsert = Database["public"]["Tables"]["item"]["Insert"];
export type ItemUpdate = Database["public"]["Tables"]["item"]["Update"];

// ─── 상품 상세 ────────────────────────────────────────────────────────────────
export type ItemDetailRow = Database["public"]["Tables"]["item_detail"]["Row"];
export type ItemDetailInsert = Database["public"]["Tables"]["item_detail"]["Insert"];
export type ItemDetailUpdate = Database["public"]["Tables"]["item_detail"]["Update"];
