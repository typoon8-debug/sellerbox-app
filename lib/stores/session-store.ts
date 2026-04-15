"use client";

import { create } from "zustand";

const SESSION_DURATION_SEC = 15 * 60; // 15분

interface SessionState {
  remainingSeconds: number;
  isExpired: boolean;
  extend: () => void;
  tick: () => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  remainingSeconds: SESSION_DURATION_SEC,
  isExpired: false,

  extend: () => set({ remainingSeconds: SESSION_DURATION_SEC, isExpired: false }),

  tick: () =>
    set((state) => {
      if (state.remainingSeconds <= 0) return { isExpired: true };
      return { remainingSeconds: state.remainingSeconds - 1 };
    }),

  reset: () => set({ remainingSeconds: SESSION_DURATION_SEC, isExpired: false }),
}));

// 초 → MM:SS 포맷
export function formatSessionTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
