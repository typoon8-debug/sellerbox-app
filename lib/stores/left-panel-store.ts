"use client";

import { create } from "zustand";

interface LeftPanelState {
  isSubMenuOpen: boolean; // 서브메뉴 영역 열림/닫힘
  showScreenNumbers: boolean; // 화면번호 show/hide
  activeMenuId: string | null; // 현재 선택된 메뉴 ID (leaf 포함)
  expandedIds: string[]; // 펼쳐진 2~4depth 메뉴 ID 목록
  searchQuery: string;
  activeSection: "favorite" | "main"; // 서브메뉴 트리에 표시할 섹션

  toggleSubMenu: () => void;
  openSubMenu: () => void;
  closeSubMenu: () => void;
  toggleScreenNumbers: () => void;
  setActiveMenu: (id: string | null) => void;
  toggleExpanded: (id: string) => void;
  expandMenu: (id: string) => void; // id 가 없을 때만 추가 (idempotent)
  setSearchQuery: (q: string) => void;
  setActiveSection: (section: "favorite" | "main") => void;
}

export const useLeftPanelStore = create<LeftPanelState>((set) => ({
  isSubMenuOpen: true,
  showScreenNumbers: false,
  activeMenuId: null,
  expandedIds: [],
  searchQuery: "",
  activeSection: "main",

  toggleSubMenu: () => set((state) => ({ isSubMenuOpen: !state.isSubMenuOpen })),

  openSubMenu: () => set({ isSubMenuOpen: true }),

  closeSubMenu: () => set({ isSubMenuOpen: false }),

  toggleScreenNumbers: () => set((state) => ({ showScreenNumbers: !state.showScreenNumbers })),

  setActiveMenu: (id) => set({ activeMenuId: id }),

  toggleExpanded: (id) =>
    set((state) => ({
      expandedIds: state.expandedIds.includes(id)
        ? state.expandedIds.filter((i) => i !== id)
        : [...state.expandedIds, id],
    })),

  expandMenu: (id) =>
    set((state) => ({
      expandedIds: state.expandedIds.includes(id) ? state.expandedIds : [...state.expandedIds, id],
    })),

  setSearchQuery: (q) => set({ searchQuery: q }),

  setActiveSection: (section) => set({ activeSection: section }),
}));
