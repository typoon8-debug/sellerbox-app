import type { Database } from "@/lib/supabase/database.types";

// ─── 재고 ─────────────────────────────────────────────────────────────────────
export type InventoryRow = Database["public"]["Tables"]["inventory"]["Row"];
export type InventoryInsert = Database["public"]["Tables"]["inventory"]["Insert"];
export type InventoryUpdate = Database["public"]["Tables"]["inventory"]["Update"];

// ─── 재고 트랜잭션 ────────────────────────────────────────────────────────────
export type InventoryTxnRow = Database["public"]["Tables"]["inventory_txn"]["Row"];
export type InventoryTxnInsert = Database["public"]["Tables"]["inventory_txn"]["Insert"];
export type InventoryTxnUpdate = Database["public"]["Tables"]["inventory_txn"]["Update"];
