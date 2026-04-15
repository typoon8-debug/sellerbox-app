"use client";

import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { MENU_TREE, findFirstLeaf, type MenuNode } from "@/lib/navigation/menu-items";
import { useLeftPanelStore } from "@/lib/stores/left-panel-store";
import { useMdiStore } from "@/lib/stores/mdi-store";
import { toast } from "sonner";
import { SettingsMenu } from "./settings-menu";

const mainMenus = MENU_TREE.filter((m) => m.section === "main");

function MenuBarItem({ node }: { node: MenuNode }) {
  const router = useRouter();
  const { activeMenuId, setActiveMenu, openSubMenu, isSubMenuOpen, expandMenu, setActiveSection } =
    useLeftPanelStore();
  const { openTab } = useMdiStore();
  const isActive = activeMenuId === node.id;
  const Icon = node.icon;

  const handleClick = () => {
    // 섹션 전환
    setActiveSection("main");
    setActiveMenu(node.id);
    if (!isSubMenuOpen) openSubMenu();

    if (node.section === "link" && node.href) {
      // 링크 메뉴(서브 없음): 바로 탭 오픈
      const result = openTab({ id: node.id, title: node.label, href: node.href });
      if (result === "limit") {
        toast.warning("탭을 더 이상 열 수 없습니다. (최대 10개)");
        return;
      }
      router.push(node.href);
      return;
    }

    if (node.children?.length) {
      // 2depth 펼치기 + 첫 번째 leaf 오픈
      expandMenu(node.id);
      const leaf = findFirstLeaf(node);
      if (leaf?.href) {
        const result = openTab({ id: leaf.id, title: leaf.label, href: leaf.href });
        if (result === "limit") {
          toast.warning("탭을 더 이상 열 수 없습니다. (최대 10개)");
          return;
        }
        setActiveMenu(leaf.id);
        router.push(leaf.href);
      }
    }
  };

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          onClick={handleClick}
          className={cn(
            "flex w-full flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors",
            isActive
              ? "bg-primary-light text-primary font-semibold"
              : "text-text-placeholder hover:bg-hover hover:text-text-body"
          )}
        >
          {Icon && <Icon className="h-4 w-4 shrink-0" />}
          <span className="px-0.5 text-center leading-tight break-all">
            {node.label.slice(0, 4)}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{node.label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function MainMenuBar() {
  const { activeSection, setActiveSection, openSubMenu, setActiveMenu } = useLeftPanelStore();

  const handleFavoriteClick = () => {
    setActiveSection("favorite");
    openSubMenu();
    setActiveMenu(null);
  };

  return (
    <div className="bg-panel border-separator flex w-14 shrink-0 flex-col overflow-y-auto border-r">
      {/* 즐겨찾기 버튼 */}
      <div className="py-1">
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={handleFavoriteClick}
              className={cn(
                "flex w-full flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors",
                activeSection === "favorite"
                  ? "bg-primary-light text-primary font-semibold"
                  : "text-text-placeholder hover:bg-hover hover:text-text-body"
              )}
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  activeSection === "favorite" ? "fill-primary text-primary" : "fill-current"
                )}
              />
              <span>즐겨찾기</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">즐겨찾기</TooltipContent>
        </Tooltip>
      </div>

      <Separator />

      {/* 메인 업무메뉴 영역 */}
      <div className="flex-1 py-1">
        {mainMenus.map((node) => (
          <MenuBarItem key={node.id} node={node} />
        ))}
      </div>

      <Separator />

      {/* 설정 영역 (팝오버 기반 내 정보/권한 설정 진입) */}
      <div className="py-1">
        <SettingsMenu />
      </div>
    </div>
  );
}
