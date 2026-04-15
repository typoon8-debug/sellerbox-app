import { toast } from "sonner";
import type { ApiResponse } from "@/lib/types/api";

/**
 * ApiResponse<T>를 sonner 토스트로 표시
 * - ok: true  → success 토스트
 * - ok: false → error 토스트
 */
export function toastResult<T>(
  result: ApiResponse<T>,
  options?: {
    successMessage?: string;
    errorPrefix?: string;
  }
): result is { ok: true; data: T } {
  if (result.ok) {
    if (options?.successMessage) {
      toast.success(options.successMessage);
    }
    return true;
  } else {
    const prefix = options?.errorPrefix ? `${options.errorPrefix}: ` : "";
    toast.error(`${prefix}${result.error.message}`);
    return false;
  }
}
