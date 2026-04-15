import type {
  ShipmentRow,
  ShipmentEventRow,
  DispatchRequestRow,
} from "@/lib/types/domain/shipment";

export const MOCK_SHIPMENTS: ShipmentRow[] = [
  {
    shipment_id: "ship-001",
    order_id: "order-003",
    tracking_no: "TRK-001",
    method: "QUICK",
    store_id: "store-001",
    depart_date: "2024-04-15",
    depart_time: "15:00",
    eta_min: 30,
    eta_max: 50,
    delivery_fee: 3000,
    quote_id: null,
    status: "DELIVERED",
    rider_id: "rider-001",
    updated_at: "2024-04-15T18:30:00Z",
  },
  {
    shipment_id: "ship-002",
    order_id: "order-002",
    tracking_no: "TRK-002",
    method: "QUICK",
    store_id: "store-001",
    depart_date: "2024-04-16",
    depart_time: "12:00",
    eta_min: 30,
    eta_max: 45,
    delivery_fee: 2500,
    quote_id: null,
    status: "OUT_FOR_DELIVERY",
    rider_id: "rider-002",
    updated_at: "2024-04-16T12:00:00Z",
  },
  {
    shipment_id: "ship-003",
    order_id: "order-001",
    tracking_no: null,
    method: "QUICK",
    store_id: "store-001",
    depart_date: null,
    depart_time: null,
    eta_min: null,
    eta_max: null,
    delivery_fee: 3000,
    quote_id: null,
    status: "READY",
    rider_id: null,
    updated_at: "2024-04-16T09:30:00Z",
  },
];

export const MOCK_SHIPMENT_EVENTS: ShipmentEventRow[] = [
  {
    event_id: "evt-001",
    shipment_id: "ship-001",
    event_code: "ASSIGNED",
    memo: "배달 기사 배정 완료",
    metadata: null,
    created_at: "2024-04-15T15:00:00Z",
  },
  {
    event_id: "evt-002",
    shipment_id: "ship-001",
    event_code: "OUT",
    memo: "배송 출발",
    metadata: null,
    created_at: "2024-04-15T16:30:00Z",
  },
  {
    event_id: "evt-003",
    shipment_id: "ship-001",
    event_code: "ARRIVED",
    memo: "배송 완료",
    metadata: null,
    created_at: "2024-04-15T18:30:00Z",
  },
  {
    event_id: "evt-004",
    shipment_id: "ship-002",
    event_code: "ASSIGNED",
    memo: "배달 기사 배정 완료",
    metadata: null,
    created_at: "2024-04-16T11:30:00Z",
  },
  {
    event_id: "evt-005",
    shipment_id: "ship-002",
    event_code: "OUT",
    memo: "배송 출발",
    metadata: null,
    created_at: "2024-04-16T12:00:00Z",
  },
];

export const MOCK_DISPATCH_REQUESTS: DispatchRequestRow[] = [
  {
    dispatch_id: "req-001",
    store_id: "store-001",
    order_id: "order-001",
    status: "REQUESTED",
    rider_id: null,
    requested_at: "2024-04-16T09:30:00Z",
    assigned_at: null,
  },
];

export const MOCK_QUICK_SLOTS = [
  {
    slot_id: "slot-001",
    timeslot: "09:00-10:00",
    capacity: 10,
    reserved_count: 7,
    is_closed: false,
  },
  {
    slot_id: "slot-002",
    timeslot: "10:00-11:00",
    capacity: 10,
    reserved_count: 10,
    is_closed: true,
  },
  {
    slot_id: "slot-003",
    timeslot: "11:00-12:00",
    capacity: 10,
    reserved_count: 4,
    is_closed: false,
  },
  {
    slot_id: "slot-004",
    timeslot: "12:00-13:00",
    capacity: 15,
    reserved_count: 12,
    is_closed: false,
  },
  {
    slot_id: "slot-005",
    timeslot: "13:00-14:00",
    capacity: 15,
    reserved_count: 8,
    is_closed: false,
  },
  {
    slot_id: "slot-006",
    timeslot: "14:00-15:00",
    capacity: 10,
    reserved_count: 2,
    is_closed: false,
  },
];

export const MOCK_DASHBOARD_STATS = {
  totalOrders: 42,
  delivered: 28,
  inFulfillment: 8,
  inDelivery: 6,
};
