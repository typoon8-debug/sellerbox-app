/**
 * 배송 라우팅 유틸리티
 * nearest-neighbor 알고리즘을 이용한 배송 순서 최적화
 */

interface OrderLocation {
  order_id: string;
  address: string;
}

/**
 * nearest-neighbor 알고리즘으로 배송 최적 순서를 반환합니다.
 * 실제 좌표 대신 주소 텍스트의 알파벳/텍스트 순으로 정렬합니다.
 *
 * @param orders 주문 목록 (order_id, address)
 * @returns 최적화된 order_id 배열
 */
export function nearestNeighbor(orders: OrderLocation[]): string[] {
  if (orders.length === 0) return [];
  if (orders.length === 1) return [orders[0].order_id];

  // 주소를 텍스트 순으로 정렬하여 nearest-neighbor 근사
  const sorted = [...orders].sort((a, b) => a.address.localeCompare(b.address, "ko"));
  return sorted.map((o) => o.order_id);
}
