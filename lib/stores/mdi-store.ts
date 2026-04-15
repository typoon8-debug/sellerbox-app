"use client";

import { create } from "zustand";

export interface MdiTab {
  id: string; // 화면 고유 ID (예: "tenants", "users-detail-u001")
  title: string; // 탭 라벨 (메뉴 full name)
  href: string; // 라우팅 경로
  dirty: boolean; // 미저장 데이터 존재 여부
}

const MAX_TABS = 10;

const HOME_TAB: MdiTab = {
  id: "home",
  title: "홈",
  href: "/",
  dirty: false,
};

interface MdiState {
  tabs: MdiTab[];
  activeTabId: string;
  splitActive: boolean;
  secondaryTabId: string | null; // 분할 화면 우측에 표시할 탭 ID

  openTab: (tab: Omit<MdiTab, "dirty">) => "opened" | "focused" | "limit";
  closeTab: (id: string) => boolean; // dirty면 false 반환 (호출자가 confirm 처리)
  forceCloseTab: (id: string) => void;
  focusTab: (id: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  setDirty: (id: string, dirty: boolean) => void;
  toggleSplit: () => void;
  resetToHome: () => void;
}

export const useMdiStore = create<MdiState>((set, get) => ({
  tabs: [HOME_TAB],
  activeTabId: "home",
  splitActive: false,
  secondaryTabId: null,

  openTab: (tab) => {
    const { tabs } = get();
    const existing = tabs.find((t) => t.id === tab.id);
    if (existing) {
      set({ activeTabId: tab.id });
      return "focused";
    }
    // 홈 탭 제외 동적 탭 최대 개수 체크
    const dynamicCount = tabs.filter((t) => t.id !== "home").length;
    if (dynamicCount >= MAX_TABS) {
      return "limit";
    }
    set((state) => ({
      tabs: [...state.tabs, { ...tab, dirty: false }],
      activeTabId: tab.id,
    }));
    return "opened";
  },

  closeTab: (id) => {
    const { tabs } = get();
    if (id === "home") return true; // 홈 탭은 닫을 수 없음
    const tab = tabs.find((t) => t.id === id);
    if (tab?.dirty) return false; // dirty — 호출자에게 확인 요청

    get().forceCloseTab(id);
    return true;
  },

  forceCloseTab: (id) => {
    if (id === "home") return;
    set((state) => {
      const idx = state.tabs.findIndex((t) => t.id === id);
      const newTabs = state.tabs.filter((t) => t.id !== id);
      let newActiveId = state.activeTabId;
      if (state.activeTabId === id) {
        // 직전 탭으로 포커스
        const prevIdx = Math.max(0, idx - 1);
        newActiveId = newTabs[prevIdx]?.id ?? "home";
      }
      // 닫힌 탭이 secondary 였으면 null 처리
      const newSecondaryId = state.secondaryTabId === id ? null : state.secondaryTabId;
      return { tabs: newTabs, activeTabId: newActiveId, secondaryTabId: newSecondaryId };
    });
  },

  focusTab: (id) => {
    set({ activeTabId: id });
  },

  reorderTabs: (fromIndex, toIndex) => {
    set((state) => {
      const tabs = [...state.tabs];
      // 홈 탭(index 0)은 이동 불가
      if (fromIndex === 0 || toIndex === 0) return {};
      const [moved] = tabs.splice(fromIndex, 1);
      tabs.splice(toIndex, 0, moved);
      return { tabs };
    });
  },

  setDirty: (id, dirty) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, dirty } : t)),
    }));
  },

  toggleSplit: () => {
    const { splitActive, tabs, activeTabId } = get();
    if (!splitActive) {
      // 활성화: 홈이 아닌 탭 우선, 없으면 홈 탭 선택
      const other =
        tabs.find((t) => t.id !== activeTabId && t.id !== "home") ??
        tabs.find((t) => t.id !== activeTabId);
      if (!other) {
        // 분할할 탭이 없음 — 활성화하지 않음 (호출 측에서 toast)
        return;
      }
      set({ splitActive: true, secondaryTabId: other.id });
    } else {
      set({ splitActive: false, secondaryTabId: null });
    }
  },

  resetToHome: () => {
    set({ tabs: [HOME_TAB], activeTabId: "home", splitActive: false, secondaryTabId: null });
  },
}));
