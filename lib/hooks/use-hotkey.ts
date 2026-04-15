"use client";

import { useEffect, useRef } from "react";

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/**
 * 키보드 단축키 훅
 *
 * @param key - 단축키 조합 ("ctrl+n", "ctrl+k", "esc" 등)
 * @param handler - 단축키가 발생했을 때 실행할 함수
 * @param options.enabled - 단축키 활성화 여부 (기본값: true)
 *
 * @example
 * useHotkey("ctrl+n", () => setOpen(true), { enabled: !isDialogOpen });
 */
export function useHotkey(key: string, handler: () => void, options?: { enabled?: boolean }) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const enabled = options?.enabled !== false;

  useEffect(() => {
    if (!enabled) return;

    const parts = key.toLowerCase().split("+");
    const mainKey = parts[parts.length - 1];
    const needsCtrl = parts.includes("ctrl");
    const needsShift = parts.includes("shift");
    const needsAlt = parts.includes("alt");

    const onKeyDown = (e: KeyboardEvent) => {
      // 입력 필드 포커스 중에는 단축키 무시 (Esc 제외)
      const target = e.target as HTMLElement;
      if (mainKey !== "escape" && INPUT_TAGS.has(target.tagName)) return;
      if (mainKey !== "escape" && target.isContentEditable) return;

      const keyMatch = mainKey === "escape" ? e.key === "Escape" : e.key.toLowerCase() === mainKey;

      if (
        keyMatch &&
        e.ctrlKey === needsCtrl &&
        e.shiftKey === needsShift &&
        e.altKey === needsAlt
      ) {
        e.preventDefault();
        handlerRef.current();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [key, enabled]);
}
