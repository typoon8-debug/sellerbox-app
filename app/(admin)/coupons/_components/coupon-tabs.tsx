"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IssuanceTab } from "@/app/(admin)/coupons/_components/tabs/issuance-tab";
import { RedemptionTab } from "@/app/(admin)/coupons/_components/tabs/redemption-tab";
import type { CouponIssuanceRow, CouponRedemptionRow } from "@/lib/types/domain/promotion";

export interface CouponTabData {
  issuances: CouponIssuanceRow[];
  redemptions: CouponRedemptionRow[];
}

interface CouponTabsProps {
  couponId: string;
  couponName: string;
  tabData: CouponTabData;
  onTabDataChange: (partial: Partial<CouponTabData>) => void;
}

export function CouponTabs({ couponId, couponName, tabData, onTabDataChange }: CouponTabsProps) {
  return (
    <div className="flex h-full min-h-0 flex-col p-4">
      <Tabs defaultValue="issuance" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mb-3 self-start">
          <TabsTrigger value="issuance">쿠폰발급</TabsTrigger>
          <TabsTrigger value="redemption">쿠폰사용</TabsTrigger>
        </TabsList>

        <div className="min-h-0 flex-1 overflow-auto">
          <TabsContent value="issuance" className="m-0">
            <IssuanceTab
              couponId={couponId}
              couponName={couponName}
              issuances={tabData.issuances}
              onDataChange={(data) => onTabDataChange({ issuances: data })}
            />
          </TabsContent>

          <TabsContent value="redemption" className="m-0">
            <RedemptionTab redemptions={tabData.redemptions} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
