"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FulfillmentTab } from "@/app/(admin)/stores/_components/tabs/fulfillment-tab";
import { SellersTab } from "@/app/(admin)/stores/_components/tabs/sellers-tab";
import { QuickPolicyTab } from "@/app/(admin)/stores/_components/tabs/quick-policy-tab";
import { TimeslotTab } from "@/app/(admin)/stores/_components/tabs/timeslot-tab";
import { SlotUsageTab } from "@/app/(admin)/stores/_components/tabs/slot-usage-tab";
import type { StoreFulfillmentRow, SellerRow } from "@/lib/types/domain/store";
import type { Database } from "@/lib/supabase/database.types";

type StoreQuickPolicyRow = Database["public"]["Tables"]["store_quick_policy"]["Row"];
type StoreQuickTimeslotRow = Database["public"]["Tables"]["store_quick_time_slot"]["Row"];
type StoreQuickSlotUsageRow = Database["public"]["Tables"]["store_quick_slot_usage"]["Row"];

export interface StoreTabData {
  fulfillments: StoreFulfillmentRow[];
  sellers: SellerRow[];
  quickPolicies: StoreQuickPolicyRow[];
  timeslots: StoreQuickTimeslotRow[];
  slotUsages: StoreQuickSlotUsageRow[];
}

interface StoreInfoTabsProps {
  storeId: string;
  tabData: StoreTabData;
  onTabDataChange: (data: Partial<StoreTabData>) => void;
}

export function StoreInfoTabs({ storeId, tabData, onTabDataChange }: StoreInfoTabsProps) {
  return (
    <div className="p-4">
      <Tabs defaultValue="fulfillment">
        <TabsList className="mb-4">
          <TabsTrigger value="fulfillment">배송정보</TabsTrigger>
          <TabsTrigger value="sellers">판매원</TabsTrigger>
          <TabsTrigger value="quick-policy">바로퀵정책</TabsTrigger>
          <TabsTrigger value="timeslot">운행표</TabsTrigger>
          <TabsTrigger value="slot-count">슬롯카운트</TabsTrigger>
        </TabsList>

        <TabsContent value="fulfillment">
          <FulfillmentTab
            storeId={storeId}
            fulfillments={tabData.fulfillments}
            onDataChange={(data) => onTabDataChange({ fulfillments: data })}
          />
        </TabsContent>

        <TabsContent value="sellers">
          <SellersTab
            storeId={storeId}
            sellers={tabData.sellers}
            onDataChange={(data) => onTabDataChange({ sellers: data })}
          />
        </TabsContent>

        <TabsContent value="quick-policy">
          <QuickPolicyTab
            storeId={storeId}
            quickPolicies={tabData.quickPolicies}
            onDataChange={(data) => onTabDataChange({ quickPolicies: data })}
          />
        </TabsContent>

        <TabsContent value="timeslot">
          <TimeslotTab
            storeId={storeId}
            timeslots={tabData.timeslots}
            onDataChange={(data) => onTabDataChange({ timeslots: data })}
          />
        </TabsContent>

        <TabsContent value="slot-count">
          <SlotUsageTab
            storeId={storeId}
            slotUsages={tabData.slotUsages}
            onDataChange={(data) => onTabDataChange({ slotUsages: data })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
