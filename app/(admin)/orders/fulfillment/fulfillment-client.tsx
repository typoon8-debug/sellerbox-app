"use client";

import { useState, useCallback, useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QueryField } from "@/components/admin/query-field";
import { QueryActions } from "@/components/admin/query-actions";
import { DateRangePicker } from "@/components/admin/domain/date-range-picker";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DashboardCards } from "@/app/(admin)/orders/fulfillment/components/dashboard-cards";
import { AlertBanner } from "@/app/(admin)/orders/fulfillment/components/alert-banner";
import { PrintListDialog } from "@/app/(admin)/orders/fulfillment/components/print-list-dialog";
import { LabelPrintDialog } from "@/app/(admin)/orders/fulfillment/components/label-print-dialog";
import { OrderListPanel } from "@/app/(admin)/orders/fulfillment/panels/order-list-panel";
import { OrderDetailPanel } from "@/app/(admin)/orders/fulfillment/panels/order-detail-panel";
import { ProcessingPanel } from "@/app/(admin)/orders/fulfillment/panels/processing-panel";
import { DispatchPanel } from "@/app/(admin)/orders/fulfillment/panels/dispatch-panel";
import { useOrderRealtime } from "@/lib/hooks/use-order-realtime";
import {
  fetchOrdersForFulfillment,
  fetchOrderItemsWithInventory,
  fetchDashboardStats,
  batchStartPicking,
  batchCompletePacking,
  batchGenerateLabels,
  batchCreateDispatchRequests,
  updateOrderStatusAction,
  fetchDispatchRequestsByStore,
} from "@/lib/actions/domain/order-fulfillment.actions";
import type {
  OrderWithCustomer,
  OrderItemWithInventory,
  DispatchRequestWithOrder,
} from "@/lib/actions/domain/order-fulfillment.actions";
import type { DashboardStats } from "@/lib/repositories/order.repository";
import type { OrderStatus } from "@/lib/types/domain/enums";

interface FulfillmentClientProps {
  stores: { store_id: string; name: string }[];
  initialStats: DashboardStats;
  today: string;
}

/** Date 객체를 "YYYY-MM-DD" 문자열로 변환 */
function formatDate(date: Date | undefined, fallback: string): string {
  if (!date) return fallback;
  return date.toISOString().split("T")[0];
}

/** 주문처리 통합 화면 메인 Client Component */
export function FulfillmentClient({ stores, initialStats, today }: FulfillmentClientProps) {
  const [isPending, startTransition] = useTransition();

  // ─── 검색 조건 ───────────────────────────────────────────────────────────────
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0]?.store_id ?? "");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date());
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());

  // ─── 대시보드 통계 ───────────────────────────────────────────────────────────
  const [stats, setStats] = useState<DashboardStats>(initialStats);

  // ─── 신규 주문 알림 ──────────────────────────────────────────────────────────
  const [alertVisible, setAlertVisible] = useState(false);

  // ─── Panel 1: 주문목록 ────────────────────────────────────────────────────────
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [deliveryFilter, setDeliveryFilter] = useState("ALL");

  // ─── Panel 2: 주문상세 ────────────────────────────────────────────────────────
  const [orderItems, setOrderItems] = useState<OrderItemWithInventory[]>([]);
  const [orderItemsLoading, setOrderItemsLoading] = useState(false);

  // ─── Panel 3: 주문처리결과 ────────────────────────────────────────────────────
  const [processedOrders, setProcessedOrders] = useState<OrderWithCustomer[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // ─── Panel 4: 배송요청 ────────────────────────────────────────────────────────
  const [dispatchRequests, setDispatchRequests] = useState<DispatchRequestWithOrder[]>([]);

  // ─── 상태 변경 확인 다이얼로그 ────────────────────────────────────────────────
  const [statusChangeConfirm, setStatusChangeConfirm] = useState<{
    orderId: string;
    newStatus: OrderStatus;
  } | null>(null);

  // ─── 출력 다이얼로그 ──────────────────────────────────────────────────────────
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);

  // ─── 데이터 조회 ─────────────────────────────────────────────────────────────
  const doSearch = useCallback(async () => {
    if (!selectedStoreId) {
      toast.warning("가게를 선택해 주세요.");
      return;
    }

    const fromStr = formatDate(dateFrom, today);
    const toStr = formatDate(dateTo, today);

    setOrdersLoading(true);
    setOrderItems([]);
    setActiveOrderId(null);
    setSelectedOrderIds(new Set());

    try {
      const [ordersResult, statsResult, dispatchResult] = await Promise.all([
        fetchOrdersForFulfillment({
          store_id: selectedStoreId,
          from_date: fromStr,
          to_date: toStr,
        }),
        fetchDashboardStats({ store_id: selectedStoreId, date: today }),
        fetchDispatchRequestsByStore({
          store_id: selectedStoreId,
          from_date: fromStr,
          to_date: toStr,
        }),
      ]);

      if (ordersResult.ok) {
        setOrders(ordersResult.data);
      } else {
        toast.error(`주문 조회 실패: ${ordersResult.error.message}`);
      }

      if (statsResult.ok) {
        setStats(statsResult.data);
      }

      if (dispatchResult.ok) {
        setDispatchRequests(dispatchResult.data);
      }
    } catch {
      toast.error("데이터 조회 중 오류가 발생했습니다.");
    } finally {
      setOrdersLoading(false);
    }
  }, [selectedStoreId, dateFrom, dateTo, today]);

  const handleReset = useCallback(() => {
    setDateFrom(new Date());
    setDateTo(new Date());
    setDeliveryFilter("ALL");
    setSelectedOrderIds(new Set());
    setActiveOrderId(null);
    setOrders([]);
    setOrderItems([]);
    setProcessedOrders([]);
    setDispatchRequests([]);
  }, []);

  // ─── 주문 행 클릭 (주문상세 조회) ─────────────────────────────────────────────
  const handleOrderClick = useCallback(async (order: OrderWithCustomer) => {
    setActiveOrderId(order.order_id);
    setOrderItemsLoading(true);
    try {
      const result = await fetchOrderItemsWithInventory({ order_id: order.order_id });
      if (result.ok) {
        setOrderItems(result.data);
      } else {
        toast.error(`주문 상세 조회 실패: ${result.error.message}`);
      }
    } finally {
      setOrderItemsLoading(false);
    }
  }, []);

  // ─── 주문 상태 변경 ──────────────────────────────────────────────────────────
  const handleStatusChange = useCallback((orderId: string, newStatus: OrderStatus) => {
    setStatusChangeConfirm({ orderId, newStatus });
  }, []);

  const doStatusChange = useCallback(() => {
    if (!statusChangeConfirm) return;
    startTransition(async () => {
      const result = await updateOrderStatusAction({
        order_id: statusChangeConfirm.orderId,
        status: statusChangeConfirm.newStatus,
      });
      if (result.ok) {
        toast.success("주문 상태가 변경되었습니다.");
        setOrders((prev) =>
          prev.map((o) =>
            o.order_id === statusChangeConfirm.orderId
              ? { ...o, status: statusChangeConfirm.newStatus }
              : o
          )
        );
        // 통계 갱신
        const statsResult = await fetchDashboardStats({ store_id: selectedStoreId, date: today });
        if (statsResult.ok) setStats(statsResult.data);
      } else {
        toast.error(result.error.message);
      }
      setStatusChangeConfirm(null);
    });
  }, [statusChangeConfirm, selectedStoreId, today]);

  // ─── 일괄 피킹 처리 ──────────────────────────────────────────────────────────
  const handlePicking = useCallback(() => {
    if (selectedOrderIds.size === 0) {
      toast.warning("피킹할 주문을 선택해 주세요.");
      return;
    }
    setActionLoading(true);
    startTransition(async () => {
      try {
        const result = await batchStartPicking({
          order_ids: [...selectedOrderIds],
          store_id: selectedStoreId,
        });
        if (result.ok) {
          const { successCount, failedIds } = result.data;
          if (successCount > 0) {
            toast.success(`${successCount}건 피킹 처리가 완료되었습니다.`);
            const processed = orders.filter((o) => selectedOrderIds.has(o.order_id));
            setProcessedOrders(processed.map((o) => ({ ...o, status: "PACKING" })));
          }
          if (failedIds.length > 0) {
            toast.warning(`${failedIds.length}건은 처리되지 않았습니다. (PAID 상태만 피킹 가능)`);
          }
          await doSearch();
        } else {
          toast.error(result.error.message);
        }
      } finally {
        setActionLoading(false);
      }
    });
  }, [selectedOrderIds, selectedStoreId, orders, doSearch]);

  // ─── 일괄 패킹 처리 ──────────────────────────────────────────────────────────
  const handlePacking = useCallback(() => {
    if (selectedOrderIds.size === 0) {
      toast.warning("패킹할 주문을 선택해 주세요.");
      return;
    }
    setActionLoading(true);
    startTransition(async () => {
      try {
        const result = await batchCompletePacking({ order_ids: [...selectedOrderIds] });
        if (result.ok) {
          const { successCount, failedIds } = result.data;
          if (successCount > 0) {
            toast.success(`${successCount}건 패킹 처리가 완료되었습니다.`);
            const processed = orders.filter((o) => selectedOrderIds.has(o.order_id));
            setProcessedOrders(processed.map((o) => ({ ...o, status: "PACKING" })));
          }
          if (failedIds.length > 0) {
            toast.warning(
              `${failedIds.length}건은 처리되지 않았습니다. (PACKING 상태만 패킹 가능)`
            );
          }
          await doSearch();
        } else {
          toast.error(result.error.message);
        }
      } finally {
        setActionLoading(false);
      }
    });
  }, [selectedOrderIds, orders, doSearch]);

  // ─── 일괄 라벨 출력 ──────────────────────────────────────────────────────────
  const handleLabelPrint = useCallback(() => {
    if (selectedOrderIds.size === 0) {
      toast.warning("라벨을 출력할 주문을 선택해 주세요.");
      return;
    }
    setActionLoading(true);
    startTransition(async () => {
      try {
        const result = await batchGenerateLabels({ order_ids: [...selectedOrderIds] });
        if (result.ok) {
          const { successCount = 0, failedIds } = result.data;
          if (successCount > 0) {
            toast.success(`${successCount}건 라벨이 생성되었습니다.`);
            setLabelDialogOpen(true);
          }
          if (failedIds.length > 0) {
            toast.warning(`${failedIds.length}건 라벨 생성에 실패했습니다.`);
          }
          await doSearch();
        } else {
          toast.error(result.error.message);
        }
      } finally {
        setActionLoading(false);
      }
    });
  }, [selectedOrderIds, doSearch]);

  // ─── 일괄 배송요청 ────────────────────────────────────────────────────────────
  const handleDispatch = useCallback(() => {
    if (selectedOrderIds.size === 0) {
      toast.warning("배송요청할 주문을 선택해 주세요.");
      return;
    }
    setActionLoading(true);
    startTransition(async () => {
      try {
        const result = await batchCreateDispatchRequests({
          order_ids: [...selectedOrderIds],
          store_id: selectedStoreId,
        });
        if (result.ok) {
          const { successCount, failedIds } = result.data;
          if (successCount > 0) {
            toast.success(`${successCount}건 배송요청이 완료되었습니다.`);
          }
          if (failedIds.length > 0) {
            toast.warning(`${failedIds.length}건은 배송요청에 실패했습니다.`);
          }
          await doSearch();
        } else {
          toast.error(result.error.message);
        }
      } finally {
        setActionLoading(false);
      }
    });
  }, [selectedOrderIds, selectedStoreId, doSearch]);

  // ─── Realtime 신규 주문 알림 ─────────────────────────────────────────────────
  useOrderRealtime({
    storeId: selectedStoreId,
    onNewOrder: useCallback(() => {
      setAlertVisible(true);
      // 5초 후 자동 닫기
      setTimeout(() => setAlertVisible(false), 5000);
      // 통계 갱신
      if (selectedStoreId) {
        fetchDashboardStats({ store_id: selectedStoreId, date: today }).then((r) => {
          if (r.ok) setStats(r.data);
        });
      }
    }, [selectedStoreId, today]),
    enabled: !!selectedStoreId,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* ─── 검색조건 영역 ─────────────────────────────────────────────────────── */}
      <div className="border-b bg-white px-4 py-3">
        <div className="flex flex-wrap items-end gap-3">
          <QueryField label="가게명" required>
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="가게를 선택해 주세요" />
              </SelectTrigger>
              <SelectContent>
                {stores.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    소속 가게 없음
                  </SelectItem>
                ) : (
                  stores.map((s) => (
                    <SelectItem key={s.store_id} value={s.store_id}>
                      {s.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </QueryField>

          <QueryField label="주문일자" required>
            <DateRangePicker
              from={dateFrom}
              to={dateTo}
              onFromChange={setDateFrom}
              onToChange={setDateTo}
            />
          </QueryField>

          <QueryActions
            onSearch={() =>
              startTransition(() => {
                doSearch();
              })
            }
            onReset={handleReset}
            loading={ordersLoading || isPending}
          />
        </div>
      </div>

      {/* ─── 신규 주문 알림 배너 ────────────────────────────────────────────────── */}
      <AlertBanner visible={alertVisible} onDismiss={() => setAlertVisible(false)} />

      {/* ─── 대시보드 통계 카드 ─────────────────────────────────────────────────── */}
      <DashboardCards stats={stats} />

      {/* ─── 상단 패널: 주문목록 + 주문상세 ─────────────────────────────────────── */}
      <div className="flex max-h-[38vh] min-h-0 divide-x border-t border-b">
        <div className="flex min-h-0 w-1/2 flex-col overflow-hidden">
          <OrderListPanel
            orders={orders}
            loading={ordersLoading}
            selectedOrderIds={selectedOrderIds}
            activeOrderId={activeOrderId}
            deliveryFilter={deliveryFilter}
            onDeliveryFilterChange={setDeliveryFilter}
            onSelectionChange={setSelectedOrderIds}
            onRowClick={handleOrderClick}
            onStatusChange={handleStatusChange}
          />
        </div>
        <div className="flex min-h-0 w-1/2 flex-col overflow-hidden">
          <OrderDetailPanel
            orderItems={orderItems}
            loading={orderItemsLoading}
            activeOrderId={activeOrderId}
          />
        </div>
      </div>

      {/* ─── 하단 패널: 주문처리 + 배송요청 ─────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 divide-x">
        <div className="flex min-h-0 w-1/2 flex-col overflow-hidden">
          <ProcessingPanel
            processedOrders={processedOrders}
            selectedOrderCount={selectedOrderIds.size}
            loading={actionLoading || isPending}
            onPicking={handlePicking}
            onPacking={handlePacking}
            onLabelPrint={handleLabelPrint}
            onPrintList={() => setPrintDialogOpen(true)}
          />
        </div>
        <div className="flex min-h-0 w-1/2 flex-col overflow-hidden">
          <DispatchPanel
            dispatchRequests={dispatchRequests}
            selectedOrderCount={selectedOrderIds.size}
            loading={actionLoading || isPending}
            onDispatch={handleDispatch}
          />
        </div>
      </div>

      {/* ─── 주문 상태 변경 확인 다이얼로그 ─────────────────────────────────────── */}
      <ConfirmDialog
        open={!!statusChangeConfirm}
        onOpenChange={(open) => !open && setStatusChangeConfirm(null)}
        title="주문 상태 변경"
        description={
          statusChangeConfirm
            ? `주문 상태를 "${statusChangeConfirm.newStatus}"(으)로 변경하시겠습니까?`
            : ""
        }
        confirmLabel="변경"
        onConfirm={doStatusChange}
      />

      {/* ─── 주문처리 리스트 출력 다이얼로그 ────────────────────────────────────── */}
      <PrintListDialog
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        selectedOrderIds={selectedOrderIds}
      />

      {/* ─── 라벨 출력 다이얼로그 ────────────────────────────────────────────────── */}
      <LabelPrintDialog
        open={labelDialogOpen}
        onOpenChange={setLabelDialogOpen}
        selectedOrderIds={selectedOrderIds}
      />
    </div>
  );
}
