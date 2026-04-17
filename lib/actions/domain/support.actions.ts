"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { CsTicketRepository } from "@/lib/repositories/cs-ticket.repository";
import { ReviewRepository } from "@/lib/repositories/review.repository";
import { CeoReviewRepository } from "@/lib/repositories/ceo-review.repository";
import {
  updateCsTicketSchema,
  fetchCsTicketsSchema,
  createCeoReviewSchema,
  updateCeoReviewSchema,
  fetchReviewsSchema,
} from "@/lib/schemas/domain/support.schema";

/** 가게별 CS 티켓 목록 조회 (기간+상태 필터) */
export const fetchCsTicketsByStore = withAction(
  fetchCsTicketsSchema,
  async ({ store_id, from_date, to_date, status }) => {
    const supabase = createAdminClient();
    const repo = new CsTicketRepository(supabase);
    const tickets = await repo.findByStoreAndDateRange(store_id, from_date, to_date, {
      status,
    });
    const openCount = await repo.countOpenByStore(store_id, from_date, to_date);
    return { tickets, openCount };
  },
  { action: "READ", resource: "CS_TICKET" }
);

/** CS 티켓 상태 업데이트 */
export const updateCsTicket = withAction(
  updateCsTicketSchema,
  async ({ ticket_id, ...rest }) => {
    const supabase = createAdminClient();
    const repo = new CsTicketRepository(supabase);
    return repo.update(ticket_id, {
      ...rest,
      modified_at: new Date().toISOString(),
    });
  },
  { action: "UPDATE", resource: "CS_TICKET" }
);

/** 가게별 리뷰 목록 조회 (기간+상태 필터) */
export const fetchReviewsByStore = withAction(
  fetchReviewsSchema,
  async ({ store_id, from_date, to_date, status }) => {
    const supabase = createAdminClient();
    const repo = new ReviewRepository(supabase);
    return repo.findByStoreAndDateRange(store_id, from_date, to_date, { status });
  },
  { action: "READ", resource: "REVIEW" }
);

/** CEO 리뷰 답변 생성 */
export const createCeoReview = withAction(
  createCeoReviewSchema,
  async (input) => {
    const supabase = createAdminClient();
    const repo = new CeoReviewRepository(supabase);
    return repo.create(input);
  },
  { action: "CREATE", resource: "CEO_REVIEW" }
);

/** CEO 리뷰 답변 수정 */
export const updateCeoReview = withAction(
  updateCeoReviewSchema,
  async ({ ceo_reviewId, ...rest }) => {
    const supabase = createAdminClient();
    const repo = new CeoReviewRepository(supabase);
    return repo.update(ceo_reviewId, {
      ...rest,
      modified_at: new Date().toISOString(),
    });
  },
  { action: "UPDATE", resource: "CEO_REVIEW" }
);
