"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import type { StoreFulfillmentRow, SellerRow } from "@/lib/types/domain/store";
import type { Database } from "@/lib/supabase/database.types";

// 바로퀵 관련 타입 정의
type StoreQuickPolicyRow = Database["public"]["Tables"]["store_quick_policy"]["Row"];
type StoreQuickTimeslotRow = Database["public"]["Tables"]["store_quick_timeslot"]["Row"];
type StoreQuickSlotUsageRow = Database["public"]["Tables"]["store_quick_slot_usage"]["Row"];

interface StoreInfoClientProps {
  fulfillments: StoreFulfillmentRow[];
  sellers: SellerRow[];
  quickPolicies: StoreQuickPolicyRow[];
  timeslots: StoreQuickTimeslotRow[];
  slotUsages: StoreQuickSlotUsageRow[];
}

export function StoreInfoClient({
  fulfillments,
  sellers,
  quickPolicies,
  timeslots,
  slotUsages,
}: StoreInfoClientProps) {
  return (
    <div className="p-6">
      <Tabs defaultValue="fulfillment">
        <TabsList className="mb-4">
          <TabsTrigger value="fulfillment">배송정보</TabsTrigger>
          <TabsTrigger value="sellers">판매원</TabsTrigger>
          <TabsTrigger value="quick-policy">바로퀵정책</TabsTrigger>
          <TabsTrigger value="timeslot">운행표</TabsTrigger>
          <TabsTrigger value="slot-count">슬롯카운트</TabsTrigger>
        </TabsList>

        {/* 배송정보 탭 */}
        <TabsContent value="fulfillment">
          <div className="border-separator rounded border">
            <Table>
              <TableHeader>
                <TableRow className="bg-panel">
                  <TableHead>풀필먼트 유형</TableHead>
                  <TableHead>활성 여부</TableHead>
                  <TableHead>등록일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fulfillments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-text-placeholder py-8 text-center">
                      배송정보가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  fulfillments.map((sf) => (
                    <TableRow key={sf.id}>
                      <TableCell>{sf.fulfillment_type}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            sf.active
                              ? "text-primary border-primary/30 bg-primary-light"
                              : "text-text-placeholder"
                          }
                        >
                          {sf.active ? "활성" : "비활성"}
                        </Badge>
                      </TableCell>
                      <TableCell>{sf.created_at?.slice(0, 10) ?? "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* 판매원 탭 */}
        <TabsContent value="sellers">
          <div className="border-separator rounded border">
            <Table>
              <TableHeader>
                <TableRow className="bg-panel">
                  <TableHead>이름</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>전화번호</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-text-placeholder py-8 text-center">
                      판매원이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  sellers.map((seller) => (
                    <TableRow key={seller.seller_id}>
                      <TableCell>{seller.name}</TableCell>
                      <TableCell>{seller.email}</TableCell>
                      <TableCell>{seller.phone ?? "-"}</TableCell>
                      <TableCell>{seller.role}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            seller.is_active === "ACTIVE"
                              ? "text-primary border-primary/30 bg-primary-light"
                              : "text-text-placeholder"
                          }
                        >
                          {seller.is_active === "ACTIVE" ? "활성" : "비활성"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* 바로퀵정책 탭 */}
        <TabsContent value="quick-policy">
          <div className="border-separator rounded border">
            <Table>
              <TableHeader>
                <TableRow className="bg-panel">
                  <TableHead>최소 주문 금액</TableHead>
                  <TableHead>일일 운행 횟수</TableHead>
                  <TableHead>슬롯당 용량</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quickPolicies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-text-placeholder py-8 text-center">
                      바로퀵 정책이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  quickPolicies.map((qp) => (
                    <TableRow key={qp.policy_id}>
                      <TableCell>{qp.min_order_amount.toLocaleString()}원</TableCell>
                      <TableCell>{qp.daily_runs}회</TableCell>
                      <TableCell>{qp.capacity_per_slot}건</TableCell>
                      <TableCell>
                        <DomainBadge
                          type="store"
                          status={qp.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* 운행표 탭 */}
        <TabsContent value="timeslot">
          <div className="border-separator rounded border">
            <Table>
              <TableHeader>
                <TableRow className="bg-panel">
                  <TableHead>라벨</TableHead>
                  <TableHead>출발 시간</TableHead>
                  <TableHead>주문 마감(분 전)</TableHead>
                  <TableHead>운행 요일</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeslots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-text-placeholder py-8 text-center">
                      운행표가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  timeslots.map((ts) => (
                    <TableRow key={ts.slot_id}>
                      <TableCell>{ts.label}</TableCell>
                      <TableCell>{ts.depart_time}</TableCell>
                      <TableCell>{ts.order_cutoff_min}분</TableCell>
                      <TableCell>{ts.dow_mask ?? "-"}</TableCell>
                      <TableCell>
                        <DomainBadge
                          type="store"
                          status={ts.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* 슬롯카운트 탭 */}
        <TabsContent value="slot-count">
          <div className="border-separator rounded border">
            <Table>
              <TableHeader>
                <TableRow className="bg-panel">
                  <TableHead>출발 날짜</TableHead>
                  <TableHead>출발 시간</TableHead>
                  <TableHead>예약 건수</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slotUsages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-text-placeholder py-8 text-center">
                      슬롯 사용량이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  slotUsages.map((su) => (
                    <TableRow key={su.usage_id}>
                      <TableCell>{su.depart_date}</TableCell>
                      <TableCell>{su.depart_time}</TableCell>
                      <TableCell>
                        <span className={su.reserved_count === 0 ? "text-primary" : ""}>
                          {su.reserved_count}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
