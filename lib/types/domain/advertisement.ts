import type { Database } from "@/lib/supabase/database.types";

// ─── 광고 콘텐츠 ──────────────────────────────────────────────────────────────
export type AdContentRow = Database["public"]["Tables"]["ad_content"]["Row"];
export type AdContentInsert = Database["public"]["Tables"]["ad_content"]["Insert"];
export type AdContentUpdate = Database["public"]["Tables"]["ad_content"]["Update"];

// ─── 광고 일정 ────────────────────────────────────────────────────────────────
export type AdScheduleRow = Database["public"]["Tables"]["ad_schedule"]["Row"];
export type AdScheduleInsert = Database["public"]["Tables"]["ad_schedule"]["Insert"];
export type AdScheduleUpdate = Database["public"]["Tables"]["ad_schedule"]["Update"];

// ─── 광고 타겟 ────────────────────────────────────────────────────────────────
export type AdTargetRow = Database["public"]["Tables"]["ad_target"]["Row"];
export type AdTargetInsert = Database["public"]["Tables"]["ad_target"]["Insert"];
export type AdTargetUpdate = Database["public"]["Tables"]["ad_target"]["Update"];

// ─── 광고 한도 ────────────────────────────────────────────────────────────────
export type AdCapRow = Database["public"]["Tables"]["ad_cap"]["Row"];
export type AdCapInsert = Database["public"]["Tables"]["ad_cap"]["Insert"];
export type AdCapUpdate = Database["public"]["Tables"]["ad_cap"]["Update"];

// ─── 광고 로그 ────────────────────────────────────────────────────────────────
export type AdLogRow = Database["public"]["Tables"]["ad_log"]["Row"];
export type AdLogInsert = Database["public"]["Tables"]["ad_log"]["Insert"];
export type AdLogUpdate = Database["public"]["Tables"]["ad_log"]["Update"];
