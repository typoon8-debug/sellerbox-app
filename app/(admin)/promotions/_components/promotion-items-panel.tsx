"use client";

import { ItemSelectGrid } from "@/app/(admin)/promotions/_components/item-select-grid";
import { PromotionItemListGrid } from "@/app/(admin)/promotions/_components/promotion-item-list-grid";
import type { ItemRow } from "@/lib/types/domain/item";
import type { PromotionItemRow } from "@/lib/types/domain/promotion";

// ─── 탭 데이터 인터페이스 ─────────────────────────────────────────────────────

export interface PromotionTabData {
  promotionItems: PromotionItemRow[];
  storeItems: ItemRow[];
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PromotionItemsPanelProps {
  promoId: string;
  storeId: string;
  tabData: PromotionTabData;
  onTabDataChange: (partial: Partial<PromotionTabData>) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PromotionItemsPanel({
  promoId,
  storeId,
  tabData,
  onTabDataChange,
}: PromotionItemsPanelProps) {
  // 이미 등록된 item_id 집합 (좌측 그리드에서 비활성화 표시용)
  const registeredItemIds = new Set(tabData.promotionItems.map((pi) => pi.item_id));

  const handleAdded = (newItem: PromotionItemRow) => {
    onTabDataChange({ promotionItems: [newItem, ...tabData.promotionItems] });
  };

  const handleUpdated = (updated: PromotionItemRow) => {
    onTabDataChange({
      promotionItems: tabData.promotionItems.map((pi) => (pi.id === updated.id ? updated : pi)),
    });
  };

  const handleDeleted = (id: string) => {
    onTabDataChange({
      promotionItems: tabData.promotionItems.filter((pi) => pi.id !== id),
    });
  };

  return (
    <div className="flex h-full min-h-0 divide-x">
      {/* 좌측: 가게 상품 선택 */}
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <ItemSelectGrid
          promoId={promoId}
          storeId={storeId}
          items={tabData.storeItems}
          registeredItemIds={registeredItemIds}
          onAdded={handleAdded}
        />
      </div>

      {/* 우측: 등록된 프로모션 상품 */}
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <PromotionItemListGrid
          promotionItems={tabData.promotionItems}
          storeItems={tabData.storeItems}
          onUpdate={handleUpdated}
          onDelete={handleDeleted}
        />
      </div>
    </div>
  );
}
