import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlertBannerProps {
  /** 배너 표시 여부 */
  visible: boolean;
  /** 알림 메시지 */
  message?: string;
  /** 배너 닫기 핸들러 */
  onDismiss: () => void;
}

/** 신규 주문 알림 배너 */
export function AlertBanner({
  visible,
  message = "딩동~~ 주문이 접수 되었습니다!!",
  onDismiss,
}: AlertBannerProps) {
  if (!visible) return null;

  return (
    <div className="mx-4 my-2 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 animate-bounce text-blue-600" />
        <span className="text-sm font-semibold text-blue-700">{message}</span>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDismiss}>
        <X className="h-4 w-4 text-blue-600" />
      </Button>
    </div>
  );
}
