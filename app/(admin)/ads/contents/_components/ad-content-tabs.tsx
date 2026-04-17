"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleTab } from "@/app/(admin)/ads/contents/_components/tabs/schedule-tab";
import { TargetTab } from "@/app/(admin)/ads/contents/_components/tabs/target-tab";
import { LogTab } from "@/app/(admin)/ads/contents/_components/tabs/log-tab";
import type {
  AdScheduleRow,
  AdTargetRow,
  AdCapRow,
  AdLogRow,
} from "@/lib/types/domain/advertisement";

export interface AdContentTabData {
  schedules: AdScheduleRow[];
  targets: AdTargetRow[];
  caps: AdCapRow[];
  logs: AdLogRow[];
}

interface AdContentTabsProps {
  contentId: string;
  storeId: string;
  tabData: AdContentTabData;
  onTabDataChange: (data: Partial<AdContentTabData>) => void;
}

export function AdContentTabs({
  contentId,
  storeId,
  tabData,
  onTabDataChange,
}: AdContentTabsProps) {
  return (
    <div className="flex h-full min-h-0 flex-col p-4">
      <Tabs defaultValue="schedule" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mb-3 self-start">
          <TabsTrigger value="schedule">광고일정</TabsTrigger>
          <TabsTrigger value="target">광고타겟</TabsTrigger>
          <TabsTrigger value="log">광고로그</TabsTrigger>
        </TabsList>

        <div className="min-h-0 flex-1 overflow-auto">
          <TabsContent value="schedule" className="m-0">
            <ScheduleTab
              contentId={contentId}
              storeId={storeId}
              schedules={tabData.schedules}
              onDataChange={(data) => onTabDataChange({ schedules: data })}
            />
          </TabsContent>

          <TabsContent value="target" className="m-0">
            <TargetTab
              contentId={contentId}
              storeId={storeId}
              targets={tabData.targets}
              caps={tabData.caps}
              onDataChange={(targets, caps) => onTabDataChange({ targets, caps })}
            />
          </TabsContent>

          <TabsContent value="log" className="m-0">
            <LogTab
              contentId={contentId}
              logs={tabData.logs}
              onDataChange={(data) => onTabDataChange({ logs: data })}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
