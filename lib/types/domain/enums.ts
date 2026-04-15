// ─── 주문 ─────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | "CREATED"
  | "PAID"
  | "PACKING"
  | "DISPATCHED"
  | "DELIVERING"
  | "DELIVERED"
  | "CANCELED"
  | "REFUNDED";

export type OrderItemStatus = "ORDERED" | "PACKING" | "SHIPPED" | "DELIVERED" | "CANCELED";

export type DeliveryMethod =
  | "DELIVERY"
  | "BBQ"
  | "PICKUP"
  | "RESERVE"
  | "FRESH_MORNING"
  | "SAME_DAY"
  | "3P_DELIVERY";

// ─── 상품 ─────────────────────────────────────────────────────────────────────
export type ItemStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";

export type ItemDetailStatus = "ACTIVE" | "INACTIVE";

// ─── 재고 ─────────────────────────────────────────────────────────────────────
export type InventoryStatus = "AVAILABLE" | "RESERVED" | "DAMAGED" | "ADJUSTED";

export type InventoryTxnType = "INBOUND" | "OUTBOUND" | "ADJUST" | "RESERVE" | "RELEASE" | "RETURN";

export type InventoryTxnStatus = "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED";

// ─── 피킹/패킹 ────────────────────────────────────────────────────────────────
export type PickingStatus = "CREATED" | "PICKING" | "PICKED" | "FAILED";

export type PickingItemResult = "OK" | "SHORT" | "SUBSTITUTE";

export type PackingStatus = "READY" | "PACKING" | "PACKED";

export type LabelType = "BOX" | "BAG" | "INVOICE";

// ─── 배송 ─────────────────────────────────────────────────────────────────────
export type ShipmentMethod = "QUICK" | "RO_ONDEMAND";

export type ShipmentStatus =
  | "READY"
  | "ASSIGNED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED"
  | "SCHEDULED";

export type ShipmentEventCode =
  | "ASSIGNED"
  | "OUT"
  | "ARRIVED"
  | "FAILED"
  | "PROOF_UPLOADED"
  | "SCHEDULED"
  | "VEHICLE_DEPARTED";

export type DispatchRequestStatus = "REQUESTED" | "ASSIGNED" | "CANCELLED";

// ─── 가게/판매원 ───────────────────────────────────────────────────────────────
export type StoreStatus = "ACTIVE" | "INACTIVE" | "CLOSED" | "PENDING";

export type StoreFulfillmentType =
  | "DELIVERY"
  | "PICKUP"
  | "BBQ"
  | "RESERVE"
  | "FRESH_MORNING"
  | "SAME_DAY"
  | "3P_DELIVERY"
  | "NONE";

export type SellerRole = "OWNER" | "MANAGER" | "PICKER" | "PACKER";

export type SellerActiveStatus = "ACTIVE" | "INACTIVE";

export type QuickPolicyStatus = "ACTIVE" | "INACTIVE";

export type QuickTimeslotStatus = "ACTIVE" | "INACTIVE";

// ─── 프로모션 ─────────────────────────────────────────────────────────────────
export type PromotionType =
  | "SALE"
  | "DISCOUNT_PCT"
  | "DISCOUNT_FIXED"
  | "ONE_PLUS_ONE"
  | "TWO_PLUS_ONE"
  | "BUNDLE";

export type PromotionDiscountUnit = "PCT" | "FIXED";

export type PromotionStatus = "SCHEDULED" | "ACTIVE" | "PAUSED" | "ENDED";

export type PromotionItemStatus = "ACTIVE" | "INACTIVE";

// ─── 쿠폰 ─────────────────────────────────────────────────────────────────────
export type CouponType = "DISCOUNT" | "SHIPPING_FREE" | "SIGNUP";

export type CouponDiscountUnit = "PCT" | "FIXED";

export type CouponStatus = "ISSUED" | "USED" | "EXPIRED" | "CANCELLED";

export type CouponRedemptionStatus = "APPLIED" | "REVOKED" | "FAILED";

// ─── 광고 ─────────────────────────────────────────────────────────────────────
export type AdContentStatus = "DRAFT" | "READY" | "ACTIVE" | "PAUSED" | "ENDED";

export type AdScheduleStatus = "SCHEDULED" | "ACTIVE" | "PAUSED" | "ENDED";

export type AdTargetOs = "IOS" | "ANDROID" | "WEB";

export type AdTargetStatus = "ACTIVE" | "INACTIVE";

export type AdCapStatus = "ACTIVE" | "INACTIVE";

export type AdLogAction = "IMPRESSION" | "CLICK";

export type AdLogPage = "HOME" | "WEEKLY_SALE";

export type AdLogAreaKey = "HERO" | "MID_1" | "MID_2" | "FOOTER";

// ─── 고객 지원 ────────────────────────────────────────────────────────────────
export type CsTicketType = "REFUND" | "EXCHANGE" | "INQUIRY";

export type CsTicketStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";

export type ReviewStatus = "VISIBLE" | "HIDDEN" | "REPORTED" | "DELETED";

export type CeoReviewStatus = "VISIBLE" | "HIDDEN" | "DELETED";

// ─── 사용자 ───────────────────────────────────────────────────────────────────
export type UserRole = "CUSTOMER" | "SELLER" | "RIDER" | "ADMIN";
