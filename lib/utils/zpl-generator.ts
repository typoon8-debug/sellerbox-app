/** ZPL 라벨 유형 */
export type LabelType = "BOX" | "BAG" | "INVOICE";

/** ZPL 생성에 필요한 데이터 */
export interface ZplData {
  /** 주문번호 */
  orderNo: string;
  /** 수령인 이름 */
  recipientName?: string;
  /** 배송 주소 */
  address?: string;
  /** 상품 수 */
  itemCount?: number;
  /** 출력일시 (기본: 현재 시각) */
  printedAt?: string;
}

/**
 * ZPL 라벨 문자열 생성
 * - BOX: 박스 외부 부착용 대형 라벨
 * - BAG: 봉투 부착용 소형 라벨
 * - INVOICE: 송장 라벨 (주소/수령인 포함)
 */
export function generateZpl(type: LabelType, data: ZplData): string {
  const now = data.printedAt ?? new Date().toLocaleString("ko-KR");

  if (type === "BOX") {
    return [
      "^XA",
      "^FO30,30^A0N,40,40^FDBOX LABEL^FS",
      `^FO30,90^A0N,28,28^FD주문번호: ${data.orderNo}^FS`,
      data.recipientName ? `^FO30,135^A0N,24,24^FD수령인: ${data.recipientName}^FS` : "",
      `^FO30,180^A0N,20,20^FD상품 수: ${data.itemCount ?? "-"}개^FS`,
      `^FO30,215^A0N,18,18^FD출력일시: ${now}^FS`,
      "^FO30,250^GB550,3,3^FS",
      "^XZ",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (type === "BAG") {
    return [
      "^XA",
      "^FO30,30^A0N,35,35^FDBAG LABEL^FS",
      `^FO30,80^A0N,26,26^FD주문: ${data.orderNo}^FS`,
      data.recipientName ? `^FO30,118^A0N,22,22^FD수령인: ${data.recipientName}^FS` : "",
      `^FO30,155^A0N,18,18^FD출력: ${now}^FS`,
      "^XZ",
    ]
      .filter(Boolean)
      .join("\n");
  }

  // INVOICE
  return [
    "^XA",
    "^FO30,30^A0N,38,38^FDINVOICE^FS",
    `^FO30,85^A0N,26,26^FD주문번호: ${data.orderNo}^FS`,
    data.recipientName ? `^FO30,125^A0N,24,24^FD수령인: ${data.recipientName}^FS` : "",
    data.address ? `^FO30,165^A0N,20,20^FD주소: ${data.address}^FS` : "",
    `^FO30,210^A0N,20,20^FD상품 수: ${data.itemCount ?? "-"}개^FS`,
    `^FO30,245^A0N,18,18^FD발행일시: ${now}^FS`,
    "^FO30,278^GB550,3,3^FS",
    "^XZ",
  ]
    .filter(Boolean)
    .join("\n");
}
