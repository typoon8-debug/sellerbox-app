"use client";

import { useEffect, useRef } from "react";

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/** 단축키 문자열을 파싱해 modifier + mainKey 추출 */
function parseKey(key: string) {
  const parts = key.toLowerCase().split("+");
  return {
    mainKey: parts[parts.length - 1],
    needsCtrl: parts.includes("ctrl"),
    needsShift: parts.includes("shift"),
    needsAlt: parts.includes("alt"),
  };
}

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

    const { mainKey, needsCtrl, needsShift, needsAlt } = parseKey(key);

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

/**
 * 여러 단축키를 한 번에 등록하는 훅 (MDI 탭 단축키 등 복수 키 조합에 적합)
 *
 * @param keyMap  - { "ctrl+w": handler, "ctrl+1": handler, ... } 형태의 맵
 * @param options - enabled: false이면 전체 비활성화
 *
 * @example
 * useHotkeyMap({
 *   "ctrl+w": () => closeCurrentTab(),
 *   "ctrl+1": () => focusTab(0),
 * });
 */
export function useHotkeyMap(keyMap: Record<string, () => void>, options?: { enabled?: boolean }) {
  const handlersRef = useRef(keyMap);
  handlersRef.current = keyMap;

  const enabled = options?.enabled !== false;

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      for (const [key, handler] of Object.entries(handlersRef.current)) {
        const { mainKey, needsCtrl, needsShift, needsAlt } = parseKey(key);

        if (mainKey !== "escape" && INPUT_TAGS.has(target.tagName)) continue;
        if (mainKey !== "escape" && target.isContentEditable) continue;

        const keyMatch =
          mainKey === "escape" ? e.key === "Escape" : e.key.toLowerCase() === mainKey;

        if (
          keyMatch &&
          e.ctrlKey === needsCtrl &&
          e.shiftKey === needsShift &&
          e.altKey === needsAlt
        ) {
          e.preventDefault();
          handler();
          break;
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
