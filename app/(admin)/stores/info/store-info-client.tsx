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
import { MOCK_STORE_FULFILLMENTS, MOCK_SELLERS } from "@/lib/mocks/store";

// 더미 퀵 정책 데이터
const MOCK_QUICK_POLICIES = [
  { id: "qp-001", slot_size_min: 30, max_orders_per_slot: 10, cutoff_min: 60, status: "ACTIVE" },
  { id: "qp-002", slot_size_min: 60, max_orders_per_slot: 15, cutoff_min: 120, status: "INACTIVE" },
];

// 더미 운행표 데이터
const MOCK_TIMESLOTS = [
  { id: "ts-001", dow: "MON-FRI", time_start: "09:00", time_end: "21:00", status: "ACTIVE" },
  { id: "ts-002", dow: "SAT-SUN", time_start: "10:00", time_end: "20:00", status: "ACTIVE" },
];

// 더미 슬롯 카운트 데이터
const MOCK_SLOT_COUNTS = [
  { slot: "09:00-10:00", capacity: 10, reserved: 7, available: 3 },
  { slot: "10:00-11:00", capacity: 10, reserved: 10, available: 0 },
  { slot: "11:00-12:00", capacity: 10, reserved: 4, available: 6 },
  { slot: "14:00-15:00", capacity: 15, reserved: 12, available: 3 },
];

export function StoreInfoClient() {
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
                {MOCK_STORE_FULFILLMENTS.map((sf) => (
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
                ))}
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
                {MOCK_SELLERS.map((seller) => (
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
                ))}
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
                  <TableHead>슬롯 크기(분)</TableHead>
                  <TableHead>슬롯당 최대 주문</TableHead>
                  <TableHead>마감 선행시간(분)</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_QUICK_POLICIES.map((qp) => (
                  <TableRow key={qp.id}>
                    <TableCell>{qp.slot_size_min}분</TableCell>
                    <TableCell>{qp.max_orders_per_slot}건</TableCell>
                    <TableCell>{qp.cutoff_min}분</TableCell>
                    <TableCell>
                      <DomainBadge
                        type="store"
                        status={qp.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
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
                  <TableHead>운행 요일</TableHead>
                  <TableHead>시작 시간</TableHead>
                  <TableHead>종료 시간</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_TIMESLOTS.map((ts) => (
                  <TableRow key={ts.id}>
                    <TableCell>{ts.dow}</TableCell>
                    <TableCell>{ts.time_start}</TableCell>
                    <TableCell>{ts.time_end}</TableCell>
                    <TableCell>
                      <DomainBadge
                        type="store"
                        status={ts.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
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
                  <TableHead>슬롯</TableHead>
                  <TableHead>총 용량</TableHead>
                  <TableHead>예약 건수</TableHead>
                  <TableHead>잔여</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_SLOT_COUNTS.map((sc) => (
                  <TableRow key={sc.slot}>
                    <TableCell>{sc.slot}</TableCell>
                    <TableCell>{sc.capacity}</TableCell>
                    <TableCell>{sc.reserved}</TableCell>
                    <TableCell>
                      <span
                        className={
                          sc.available === 0 ? "text-alert-red font-medium" : "text-primary"
                        }
                      >
                        {sc.available}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
