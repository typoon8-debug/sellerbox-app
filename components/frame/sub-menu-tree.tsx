"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { MENU_TREE, type MenuNode } from "@/lib/navigation/menu-items";
import { useLeftPanelStore } from "@/lib/stores/left-panel-store";
import { useMdiStore } from "@/lib/stores/mdi-store";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { MenuSearchInput } from "./menu-search-input";

// 메인 업무 메뉴 (서브메뉴 보유)
const mainMenus = MENU_TREE.filter((m) => m.section === "main" && m.children?.length);
// 즐겨찾기 메뉴 (leaf 항목 직접 렌더)
const favoriteMenus = MENU_TREE.filter((m) => m.section === "favorite");

function filterMenus(nodes: MenuNode[], query: string): MenuNode[] {
  if (!query) return nodes;
  return nodes.reduce<MenuNode[]>((acc, node) => {
    const labelMatch = node.label.toLowerCase().includes(query.toLowerCase());
    const filteredChildren = node.children ? filterMenus(node.children, query) : [];
    if (labelMatch || filteredChildren.length > 0) {
      acc.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children,
      });
    }
    return acc;
  }, []);
}

function LeafMenuItem({ node }: { node: MenuNode }) {
  const router = useRouter();
  const { showScreenNumbers, activeMenuId, setActiveMenu } = useLeftPanelStore();
  const { openTab } = useMdiStore();
  const isActive = activeMenuId === node.id;

  const handleClick = () => {
    if (!node.href) return;
    setActiveMenu(node.id);
    const result = openTab({ id: node.id, title: node.label, href: node.href });
    if (result === "limit") {
      toast.warning("탭을 더 이상 열 수 없습니다. (최대 10개)");
      return;
    }
    router.push(node.href);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex w-full items-center gap-2 py-2 pr-3 pl-8 text-sm transition-colors",
        isActive
          ? "bg-primary-light text-primary font-semibold"
          : "text-text-placeholder hover:bg-hover hover:text-text-body"
      )}
    >
      <Hash className="text-text-placeholder/60 h-3 w-3 shrink-0" />
      <span className="flex-1 truncate text-left">{node.label}</span>
      {showScreenNumbers && node.screenNumber && (
        <span className="text-text-placeholder shrink-0 text-[10px]">{node.screenNumber}</span>
      )}
    </button>
  );
}

function ParentMenuItem({ node }: { node: MenuNode }) {
  const { expandedIds, toggleExpanded, showScreenNumbers } = useLeftPanelStore();
  const isOpen = expandedIds.includes(node.id);
  const Icon = node.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={() => toggleExpanded(node.id)}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium transition-colors",
            isOpen
              ? "bg-hover/60 text-text-body"
              : "text-text-placeholder hover:bg-hover hover:text-text-body"
          )}
        >
          {Icon && <Icon className="h-4 w-4 shrink-0" />}
          <span className="flex-1 truncate text-left">{node.label}</span>
          {showScreenNumbers && node.screenNumber && (
            <span className="text-text-placeholder shrink-0 text-[10px]">{node.screenNumber}</span>
          )}
          {isOpen ? (
            <ChevronDown className="h-3 w-3 shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {node.children?.map((child) =>
          child.children?.length ? (
            <ParentMenuItem key={child.id} node={child} />
          ) : (
            <LeafMenuItem key={child.id} node={child} />
          )
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function SubMenuTree() {
  const { searchQuery, setSearchQuery, activeSection } = useLeftPanelStore();
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [filteredMenus, setFilteredMenus] = useState(mainMenus);

  useEffect(() => {
    if (activeSection === "favorite") {
      setFilteredMenus(filterMenus(favoriteMenus, debouncedQuery));
    } else {
      setFilteredMenus(filterMenus(mainMenus, debouncedQuery));
    }
  }, [debouncedQuery, activeSection]);

  return (
    <div className="bg-panel border-separator flex flex-col border-r" style={{ width: "184px" }}>
      {/* 섹션 헤더 */}
      {activeSection === "favorite" && (
        <div className="border-separator border-b px-3 py-2">
          <span className="text-primary text-xs font-semibold">즐겨찾기</span>
        </div>
      )}

      {/* 메뉴 검색 (즐겨찾기 섹션에서도 활성) */}
      <div className="border-separator border-b px-1.5 py-1">
        <MenuSearchInput value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* 트리 */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {filteredMenus.length === 0 ? (
            <p className="text-text-placeholder px-3 py-4 text-center text-xs">
              메뉴를 찾을 수 없습니다.
            </p>
          ) : activeSection === "favorite" ? (
            filteredMenus.map((node) => <LeafMenuItem key={node.id} node={node} />)
          ) : (
            filteredMenus.map((node) => <ParentMenuItem key={node.id} node={node} />)
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
