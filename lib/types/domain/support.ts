import type { Database } from "@/lib/supabase/database.types";

// ─── CS 티켓 ──────────────────────────────────────────────────────────────────
export type CsTicketRow = Database["public"]["Tables"]["cs_ticket"]["Row"];
export type CsTicketInsert = Database["public"]["Tables"]["cs_ticket"]["Insert"];
export type CsTicketUpdate = Database["public"]["Tables"]["cs_ticket"]["Update"];

// ─── 리뷰 ─────────────────────────────────────────────────────────────────────
export type ReviewRow = Database["public"]["Tables"]["review"]["Row"];
export type ReviewInsert = Database["public"]["Tables"]["review"]["Insert"];
export type ReviewUpdate = Database["public"]["Tables"]["review"]["Update"];

// ─── CEO 답변 ─────────────────────────────────────────────────────────────────
export type CeoReviewRow = Database["public"]["Tables"]["ceo_review"]["Row"];
export type CeoReviewInsert = Database["public"]["Tables"]["ceo_review"]["Insert"];
export type CeoReviewUpdate = Database["public"]["Tables"]["ceo_review"]["Update"];
