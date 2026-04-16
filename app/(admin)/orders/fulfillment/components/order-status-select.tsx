import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import type { OrderStatus } from "@/lib/types/domain/enums";

/** 주문 상태 목록 */
const ORDER_STATUSES: OrderStatus[] = [
  "CREATED",
  "PAID",
  "PACKING",
  "DISPATCHED",
  "DELIVERING",
  "DELIVERED",
  "CANCELED",
  "REFUNDED",
];

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  disabled?: boolean;
}

/** 주문 상태 인라인 수정 셀렉트 */
export function OrderStatusSelect({
  orderId,
  currentStatus,
  onStatusChange,
  disabled,
}: OrderStatusSelectProps) {
  return (
    <Select
      value={currentStatus}
      onValueChange={(v) => onStatusChange(orderId, v as OrderStatus)}
      disabled={disabled}
    >
      <SelectTrigger
        className="h-7 w-28 border-none bg-transparent p-0 text-xs shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        <SelectValue>
          <DomainBadge type="order" status={currentStatus} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent onClick={(e) => e.stopPropagation()}>
        {ORDER_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            <DomainBadge type="order" status={s} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
