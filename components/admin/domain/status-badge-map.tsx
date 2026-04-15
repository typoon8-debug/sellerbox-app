import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  OrderStatus,
  ItemStatus,
  InventoryStatus,
  InventoryTxnStatus,
  PickingStatus,
  PackingStatus,
  ShipmentStatus,
  DispatchRequestStatus,
  PromotionStatus,
  CouponStatus,
  CsTicketStatus,
  ReviewStatus,
  StoreStatus,
} from "@/lib/types/domain/enums";

// ─── 색상 맵 타입 ───────────────────────────────────────────────────────────────
interface BadgeConfig {
  label: string;
  className: string;
}

// ─── 주문 상태 ─────────────────────────────────────────────────────────────────
const orderStatusMap: Record<OrderStatus, BadgeConfig> = {
  CREATED: { label: "주문접수", className: "bg-blue-50 text-blue-700 border-blue-200" },
  PAID: { label: "결제완료", className: "bg-primary-light text-primary border-primary/30" },
  PACKING: { label: "패킹중", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  DISPATCHED: { label: "출고완료", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  DELIVERING: { label: "배송중", className: "bg-orange-50 text-orange-700 border-orange-200" },
  DELIVERED: { label: "배송완료", className: "bg-green-50 text-green-700 border-green-200" },
  CANCELED: { label: "취소", className: "bg-disabled text-text-placeholder border-separator" },
  REFUNDED: { label: "환불", className: "bg-alert-red-bg text-alert-red border-alert-red/30" },
};

// ─── 상품 상태 ─────────────────────────────────────────────────────────────────
const itemStatusMap: Record<ItemStatus, BadgeConfig> = {
  ACTIVE: { label: "판매중", className: "bg-primary-light text-primary border-primary/30" },
  INACTIVE: { label: "비활성", className: "bg-disabled text-text-placeholder border-separator" },
  OUT_OF_STOCK: { label: "품절", className: "bg-required text-yellow-700 border-yellow-300" },
  DISCONTINUED: { label: "단종", className: "bg-alert-red-bg text-alert-red border-alert-red/30" },
};

// ─── 재고 상태 ─────────────────────────────────────────────────────────────────
const inventoryStatusMap: Record<InventoryStatus, BadgeConfig> = {
  AVAILABLE: { label: "정상", className: "bg-primary-light text-primary border-primary/30" },
  RESERVED: { label: "예약", className: "bg-blue-50 text-blue-700 border-blue-200" },
  DAMAGED: { label: "불량", className: "bg-alert-red-bg text-alert-red border-alert-red/30" },
  ADJUSTED: { label: "조정", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
};

// ─── 재고 트랜잭션 상태 ────────────────────────────────────────────────────────
const inventoryTxnStatusMap: Record<InventoryTxnStatus, BadgeConfig> = {
  PENDING: { label: "대기", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  COMPLETED: { label: "완료", className: "bg-primary-light text-primary border-primary/30" },
  CANCELLED: { label: "취소", className: "bg-disabled text-text-placeholder border-separator" },
  FAILED: { label: "실패", className: "bg-alert-red-bg text-alert-red border-alert-red/30" },
};

// ─── 피킹 상태 ─────────────────────────────────────────────────────────────────
const pickingStatusMap: Record<PickingStatus, BadgeConfig> = {
  CREATED: { label: "대기", className: "bg-blue-50 text-blue-700 border-blue-200" },
  PICKING: { label: "피킹중", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  PICKED: { label: "완료", className: "bg-primary-light text-primary border-primary/30" },
  FAILED: { label: "실패", className: "bg-alert-red-bg text-alert-red border-alert-red/30" },
};

// ─── 패킹 상태 ─────────────────────────────────────────────────────────────────
const packingStatusMap: Record<PackingStatus, BadgeConfig> = {
  READY: { label: "대기", className: "bg-blue-50 text-blue-700 border-blue-200" },
  PACKING: { label: "패킹중", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  PACKED: { label: "완료", className: "bg-primary-light text-primary border-primary/30" },
};

// ─── 배송 상태 ─────────────────────────────────────────────────────────────────
const shipmentStatusMap: Record<ShipmentStatus, BadgeConfig> = {
  READY: { label: "준비", className: "bg-blue-50 text-blue-700 border-blue-200" },
  ASSIGNED: { label: "배정", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  PICKED_UP: { label: "픽업완료", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  OUT_FOR_DELIVERY: {
    label: "배송중",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  DELIVERED: { label: "배송완료", className: "bg-primary-light text-primary border-primary/30" },
  FAILED: { label: "실패", className: "bg-alert-red-bg text-alert-red border-alert-red/30" },
  SCHEDULED: { label: "예약", className: "bg-purple-50 text-purple-700 border-purple-200" },
};

// ─── 배송 요청 상태 ────────────────────────────────────────────────────────────
const dispatchRequestStatusMap: Record<DispatchRequestStatus, BadgeConfig> = {
  REQUESTED: { label: "요청", className: "bg-blue-50 text-blue-700 border-blue-200" },
  ASSIGNED: { label: "배정", className: "bg-primary-light text-primary border-primary/30" },
  CANCELLED: { label: "취소", className: "bg-disabled text-text-placeholder border-separator" },
};

// ─── 가게 상태 ─────────────────────────────────────────────────────────────────
const storeStatusMap: Record<StoreStatus, BadgeConfig> = {
  ACTIVE: { label: "운영중", className: "bg-primary-light text-primary border-primary/30" },
  INACTIVE: { label: "비활성", className: "bg-disabled text-text-placeholder border-separator" },
  CLOSED: { label: "폐업", className: "bg-alert-red-bg text-alert-red border-alert-red/30" },
  PENDING: { label: "대기", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
};

// ─── 프로모션 상태 ─────────────────────────────────────────────────────────────
const promotionStatusMap: Record<PromotionStatus, BadgeConfig> = {
  SCHEDULED: { label: "예약", className: "bg-blue-50 text-blue-700 border-blue-200" },
  ACTIVE: { label: "진행중", className: "bg-primary-light text-primary border-primary/30" },
  PAUSED: { label: "일시정지", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  ENDED: { label: "종료", className: "bg-disabled text-text-placeholder border-separator" },
};

// ─── 쿠폰 상태 ─────────────────────────────────────────────────────────────────
const couponStatusMap: Record<CouponStatus, BadgeConfig> = {
  ISSUED: { label: "발급", className: "bg-primary-light text-primary border-primary/30" },
  USED: { label: "사용", className: "bg-blue-50 text-blue-700 border-blue-200" },
  EXPIRED: { label: "만료", className: "bg-disabled text-text-placeholder border-separator" },
  CANCELLED: { label: "취소", className: "bg-alert-red-bg text-alert-red border-alert-red/30" },
};

// ─── CS 티켓 상태 ──────────────────────────────────────────────────────────────
const csTicketStatusMap: Record<CsTicketStatus, BadgeConfig> = {
  OPEN: { label: "접수", className: "bg-blue-50 text-blue-700 border-blue-200" },
  IN_PROGRESS: { label: "처리중", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  CLOSED: { label: "완료", className: "bg-primary-light text-primary border-primary/30" },
};

// ─── 리뷰 상태 ─────────────────────────────────────────────────────────────────
const reviewStatusMap: Record<ReviewStatus, BadgeConfig> = {
  VISIBLE: { label: "공개", className: "bg-primary-light text-primary border-primary/30" },
  HIDDEN: { label: "숨김", className: "bg-disabled text-text-placeholder border-separator" },
  REPORTED: { label: "신고", className: "bg-required text-yellow-700 border-yellow-300" },
  DELETED: { label: "삭제", className: "bg-alert-red-bg text-alert-red border-alert-red/30" },
};

// ─── 상태 타입 유니온 ──────────────────────────────────────────────────────────
type DomainStatusType =
  | "order"
  | "item"
  | "inventory"
  | "inventoryTxn"
  | "picking"
  | "packing"
  | "shipment"
  | "dispatchRequest"
  | "store"
  | "promotion"
  | "coupon"
  | "csTicket"
  | "review";

const statusMaps: Record<DomainStatusType, Record<string, BadgeConfig>> = {
  order: orderStatusMap,
  item: itemStatusMap,
  inventory: inventoryStatusMap,
  inventoryTxn: inventoryTxnStatusMap,
  picking: pickingStatusMap,
  packing: packingStatusMap,
  shipment: shipmentStatusMap,
  dispatchRequest: dispatchRequestStatusMap,
  store: storeStatusMap,
  promotion: promotionStatusMap,
  coupon: couponStatusMap,
  csTicket: csTicketStatusMap,
  review: reviewStatusMap,
};

// ─── DomainBadge 컴포넌트 ─────────────────────────────────────────────────────
interface DomainBadgeProps {
  type: DomainStatusType;
  status: string;
  className?: string;
}

export function DomainBadge({ type, status, className }: DomainBadgeProps) {
  const map = statusMaps[type];
  const config = map[status] ?? {
    label: status,
    className: "bg-disabled text-text-placeholder border-separator",
  };
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}
