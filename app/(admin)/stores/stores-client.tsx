"use client";

import { useState, useCallback } from "react";
import { TenantSearchGrid } from "@/app/(admin)/stores/_components/tenant-search-grid";
import { StoreGrid } from "@/app/(admin)/stores/_components/store-grid";
import { StoreDetailForm } from "@/app/(admin)/stores/_components/store-detail-form";
import { StoreInfoTabs, type StoreTabData } from "@/app/(admin)/stores/_components/store-info-tabs";
import { StoreRegisterDialog } from "@/app/(admin)/stores/_components/store-register-dialog";
import { fetchStoresByTenant, fetchStoreInfoTabs } from "@/lib/actions/domain/store-query.actions";
import { toast } from "sonner";
import type { TenantRow, StoreRow } from "@/lib/types/domain/store";
import type { PaginatedResult } from "@/lib/types/api";

const EMPTY_TAB_DATA: StoreTabData = {
  fulfillments: [],
  sellers: [],
  quickPolicies: [],
  timeslots: [],
  slotUsages: [],
};

interface StoresClientProps {
  initialTenants: PaginatedResult<TenantRow>;
}

export function StoresClient({ initialTenants }: StoresClientProps) {
  const [tenants] = useState<TenantRow[]>(initialTenants.data);
  const [filteredTenants, setFilteredTenants] = useState<TenantRow[]>(initialTenants.data);
  const [selectedTenant, setSelectedTenant] = useState<TenantRow | null>(null);
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreRow | null>(null);
  const [tabData, setTabData] = useState<StoreTabData>(EMPTY_TAB_DATA);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [isLoadingTabs, setIsLoadingTabs] = useState(false);

  // 테넌트 검색 (클라이언트 사이드 필터링)
  const handleTenantSearch = useCallback(
    (query: string) => {
      if (!query) {
        setFilteredTenants(tenants);
        return;
      }
      const lower = query.toLowerCase();
      setFilteredTenants(
        tenants.filter(
          (t) => t.name.toLowerCase().includes(lower) || t.code.toLowerCase().includes(lower)
        )
      );
    },
    [tenants]
  );

  // 테넌트 선택 → 해당 테넌트의 가게 목록 로드
  const handleTenantSelect = useCallback(async (tenant: TenantRow) => {
    setSelectedTenant(tenant);
    setSelectedStore(null);
    setTabData(EMPTY_TAB_DATA);
    setIsLoadingStores(true);

    const result = await fetchStoresByTenant({ tenant_id: tenant.tenant_id });
    setIsLoadingStores(false);

    if (!result.ok) {
      toast.error(result.error.message);
      setStores([]);
      return;
    }
    setStores(result.data as StoreRow[]);
  }, []);

  // 가게 선택 → 상세 정보 및 탭 데이터 로드
  const handleStoreSelect = useCallback(async (store: StoreRow) => {
    setSelectedStore(store);
    setIsLoadingTabs(true);

    const result = await fetchStoreInfoTabs({ store_id: store.store_id });
    setIsLoadingTabs(false);

    if (!result.ok) {
      toast.error(result.error.message);
      setTabData(EMPTY_TAB_DATA);
      return;
    }
    setTabData(result.data as StoreTabData);
  }, []);

  // 가게 선택 해제
  const handleStoreClose = useCallback(() => {
    setSelectedStore(null);
    setTabData(EMPTY_TAB_DATA);
  }, []);

  // 가게 정보 저장 후
  const handleStoreSaved = useCallback((updatedStore: StoreRow) => {
    setSelectedStore(updatedStore);
    setStores((prev) => prev.map((s) => (s.store_id === updatedStore.store_id ? updatedStore : s)));
  }, []);

  // 가게 삭제 후
  const handleStoreDeleted = useCallback(
    (storeId: string) => {
      setStores((prev) => prev.filter((s) => s.store_id !== storeId));
      if (selectedStore?.store_id === storeId) {
        setSelectedStore(null);
        setTabData(EMPTY_TAB_DATA);
      }
    },
    [selectedStore]
  );

  // 가게 등록 후
  const handleStoreCreated = useCallback((newStore: StoreRow) => {
    setStores((prev) => [newStore, ...prev]);
  }, []);

  // 탭 데이터 변경 시 부분 업데이트
  const handleTabDataChange = useCallback((partial: Partial<StoreTabData>) => {
    setTabData((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <div className="flex flex-col">
      {/* 상단: 테넌트 검색 + Grid */}
      <TenantSearchGrid
        tenants={filteredTenants}
        selectedTenantId={selectedTenant?.tenant_id ?? null}
        onTenantSelect={handleTenantSelect}
        onSearch={handleTenantSearch}
      />

      {/* 중단: 가게 Grid */}
      <StoreGrid
        stores={isLoadingStores ? [] : stores}
        selectedStoreId={selectedStore?.store_id ?? null}
        selectedTenant={selectedTenant}
        onStoreSelect={handleStoreSelect}
        onAddStore={() => setRegisterOpen(true)}
        onStoreDeleted={handleStoreDeleted}
      />

      {/* 하단: 가게 상세 폼 + 탭 (가게 선택 시만 표시) */}
      {selectedStore && (
        <>
          <StoreDetailForm
            store={selectedStore}
            onClose={handleStoreClose}
            onSaved={handleStoreSaved}
          />
          {!isLoadingTabs && (
            <StoreInfoTabs
              storeId={selectedStore.store_id}
              tabData={tabData}
              onTabDataChange={handleTabDataChange}
            />
          )}
          {isLoadingTabs && (
            <div className="text-text-placeholder border-separator border-b p-8 text-center text-sm">
              탭 데이터를 불러오는 중...
            </div>
          )}
        </>
      )}

      {/* 가게 등록 다이얼로그 */}
      {selectedTenant && (
        <StoreRegisterDialog
          open={registerOpen}
          onOpenChange={setRegisterOpen}
          tenant={selectedTenant}
          onStoreCreated={handleStoreCreated}
        />
      )}
    </div>
  );
}
