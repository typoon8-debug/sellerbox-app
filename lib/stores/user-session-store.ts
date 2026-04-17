"use client";

import { create } from "zustand";

interface StoreInfo {
  store_id: string;
  tenant_id: string | null;
  name: string;
}

interface UserSessionState {
  sellerId: string | null;
  storeId: string | null;
  tenantId: string | null;
  stores: StoreInfo[];
  setSession: (payload: Partial<Omit<UserSessionState, "setSession" | "clearSession">>) => void;
  clearSession: () => void;
}

export const useUserSessionStore = create<UserSessionState>((set) => ({
  sellerId: null,
  storeId: null,
  tenantId: null,
  stores: [],

  setSession: (payload) => set((state) => ({ ...state, ...payload })),

  clearSession: () => set({ sellerId: null, storeId: null, tenantId: null, stores: [] }),
}));
