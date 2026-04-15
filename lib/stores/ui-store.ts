import { create } from "zustand";

interface UiState {
  /** 전역 로딩 팝업 */
  loadingOpen: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  loadingOpen: false,
  loadingMessage: "처리 중...",
  showLoading: (message = "처리 중...") => set({ loadingOpen: true, loadingMessage: message }),
  hideLoading: () => set({ loadingOpen: false }),
}));
