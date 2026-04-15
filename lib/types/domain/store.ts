import type { Database } from "@/lib/supabase/database.types";

// ─── 테넌트 ───────────────────────────────────────────────────────────────────
export type TenantRow = Database["public"]["Tables"]["tenant"]["Row"];
export type TenantInsert = Database["public"]["Tables"]["tenant"]["Insert"];
export type TenantUpdate = Database["public"]["Tables"]["tenant"]["Update"];

// ─── 가게 ─────────────────────────────────────────────────────────────────────
export type StoreRow = Database["public"]["Tables"]["store"]["Row"];
export type StoreInsert = Database["public"]["Tables"]["store"]["Insert"];
export type StoreUpdate = Database["public"]["Tables"]["store"]["Update"];

// ─── 가게 풀필먼트 ────────────────────────────────────────────────────────────
export type StoreFulfillmentRow = Database["public"]["Tables"]["store_fulfillment"]["Row"];
export type StoreFulfillmentInsert = Database["public"]["Tables"]["store_fulfillment"]["Insert"];
export type StoreFulfillmentUpdate = Database["public"]["Tables"]["store_fulfillment"]["Update"];

// ─── 판매원 ───────────────────────────────────────────────────────────────────
export type SellerRow = Database["public"]["Tables"]["seller"]["Row"];
export type SellerInsert = Database["public"]["Tables"]["seller"]["Insert"];
export type SellerUpdate = Database["public"]["Tables"]["seller"]["Update"];
