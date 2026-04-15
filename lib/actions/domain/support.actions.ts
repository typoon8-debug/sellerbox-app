"use server";

import { withAction } from "@/app/_actions/_utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { CsTicketRepository } from "@/lib/repositories/cs-ticket.repository";
import { CeoReviewRepository } from "@/lib/repositories/ceo-review.repository";
import {
  updateCsTicketSchema,
  createCeoReviewSchema,
  updateCeoReviewSchema,
} from "@/lib/schemas/domain/support.schema";

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
