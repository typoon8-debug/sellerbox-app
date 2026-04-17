import type { Database } from "@/lib/supabase/database.types";

// ─── CS 티켓 ──────────────────────────────────────────────────────────────────
export type CsTicketRow = Database["public"]["Tables"]["cs_ticket"]["Row"];
export type CsTicketInsert = Database["public"]["Tables"]["cs_ticket"]["Insert"];
export type CsTicketUpdate = Database["public"]["Tables"]["cs_ticket"]["Update"];

// cs_ticket은 store_id 컬럼이 없어 order 경유 조인으로 가게 스코프 처리
export interface CsTicketWithJoins extends CsTicketRow {
  order: {
    order_id: string;
    store_id: string;
    ordered_at: string | null;
    order_item: { qty: number; item: { name: string } | null }[];
  } | null;
  customer: { user_id: string; email: string } | null;
}

// ─── 리뷰 ─────────────────────────────────────────────────────────────────────
export type ReviewRow = Database["public"]["Tables"]["review"]["Row"];
export type ReviewInsert = Database["public"]["Tables"]["review"]["Insert"];
export type ReviewUpdate = Database["public"]["Tables"]["review"]["Update"];

export interface ReviewWithJoins extends ReviewRow {
  item: { item_id: string; name: string } | null;
  customer: { user_id: string; email: string } | null;
  ceo_review: CeoReviewRow | null;
}

// ─── CEO 답변 ─────────────────────────────────────────────────────────────────
export type CeoReviewRow = Database["public"]["Tables"]["ceo_review"]["Row"];
export type CeoReviewInsert = Database["public"]["Tables"]["ceo_review"]["Insert"];
export type CeoReviewUpdate = Database["public"]["Tables"]["ceo_review"]["Update"];
