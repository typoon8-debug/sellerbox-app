"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";
import { useMdiStore } from "@/lib/stores/mdi-store";
import { cn } from "@/lib/utils";

export function TabMenuList() {
  const router = useRouter();
  const { tabs, activeTabId, focusTab } = useMdiStore();
  const [open, setOpen] = useState(false);

  const handleSelect = (id: string, href: string) => {
    focusTab(id);
    router.push(href);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <List className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1">
        <p className="text-text-placeholder px-2 py-1 text-xs">열린 탭 목록</p>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id, tab.href)}
            className={cn(
              "hover:bg-hover flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors",
              activeTabId === tab.id && "bg-primary-light text-primary font-medium"
            )}
          >
            <span className="truncate">{tab.title}</span>
            {tab.dirty && <span className="text-primary ml-auto shrink-0 text-[10px]">●</span>}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
