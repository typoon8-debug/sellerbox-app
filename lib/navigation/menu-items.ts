import type { LucideIcon } from "lucide-react";
import { Building2, Users, Code2, Megaphone, Settings, Star } from "lucide-react";

export interface MenuNode {
  id: string;
  label: string;
  icon?: LucideIcon;
  href?: string;
  screenNumber?: string;
  children?: MenuNode[];
  section: "favorite" | "main" | "link";
}

export const MENU_TREE: MenuNode[] = [
  // 즐겨찾기 (더미: 테넌트 관리 1건)
  {
    id: "fav-tenants",
    label: "테넌트 관리",
    icon: Building2,
    href: "/tenants",
    screenNumber: "10001",
    section: "favorite",
  },

  // 메인 업무 메뉴
  {
    id: "tenants",
    label: "테넌트 관리",
    icon: Building2,
    section: "main",
    screenNumber: "10000",
    children: [
      {
        id: "tenants-list",
        label: "테넌트 조회/목록",
        href: "/tenants",
        screenNumber: "10001",
        section: "main",
      },
    ],
  },
  {
    id: "users",
    label: "사용자 관리",
    icon: Users,
    section: "main",
    screenNumber: "20000",
    children: [
      {
        id: "users-list",
        label: "사용자 조회/목록",
        href: "/users",
        screenNumber: "20001",
        section: "main",
      },
    ],
  },
  {
    id: "codes",
    label: "공통코드 관리",
    icon: Code2,
    section: "main",
    screenNumber: "30000",
    children: [
      {
        id: "codes-list",
        label: "공통코드 관리",
        href: "/codes",
        screenNumber: "30001",
        section: "main",
      },
    ],
  },
  {
    id: "ads",
    label: "광고 관리",
    icon: Megaphone,
    section: "main",
    screenNumber: "40000",
    children: [
      {
        id: "ads-list",
        label: "광고관리",
        href: "/ads",
        screenNumber: "40001",
        section: "main",
      },
    ],
  },

  // 링크 업무 메뉴 (서브메뉴 없음)
  {
    id: "settings",
    label: "설정",
    icon: Settings,
    href: "/settings",
    screenNumber: "90001",
    section: "link",
  },
];

// 노드에서 href 를 가진 첫 번째 leaf 탐색 (BFS)
export function findFirstLeaf(node: MenuNode): MenuNode | null {
  if (!node.children?.length) return node.href ? node : null;
  for (const child of node.children) {
    const found = findFirstLeaf(child);
    if (found) return found;
  }
  return null;
}

// 화면ID로 메뉴 항목 찾기
export function findMenuById(id: string): MenuNode | undefined {
  const search = (nodes: MenuNode[]): MenuNode | undefined => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = search(node.children);
        if (found) return found;
      }
    }
    return undefined;
  };
  return search(MENU_TREE);
}

// href로 breadcrumb 경로 배열 생성
export function getBreadcrumbByHref(href: string): MenuNode[] {
  const result: MenuNode[] = [];
  const search = (nodes: MenuNode[], path: MenuNode[]): boolean => {
    for (const node of nodes) {
      const currentPath = [...path, node];
      if (node.href === href) {
        result.push(...currentPath);
        return true;
      }
      if (node.children && search(node.children, currentPath)) {
        return true;
      }
    }
    return false;
  };
  search(MENU_TREE, []);
  return result;
}

// Star 아이콘 export (즐겨찾기에 사용)
export { Star };
