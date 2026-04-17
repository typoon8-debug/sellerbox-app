import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Store,
  Package,
  Truck,
  Headphones,
  Settings,
  Star,
  BarChart3,
} from "lucide-react";

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
  // ─── 홈 (10000) ──────────────────────────────────────────────────────────
  {
    id: "main",
    label: "홈",
    icon: LayoutDashboard,
    href: "/shipments/dashboard",
    screenNumber: "10001",
    section: "main",
  },

  // ─── 가게관리 (20000) ─────────────────────────────────────────────────────
  {
    id: "store-mgmt",
    label: "가게관리",
    icon: Store,
    section: "main",
    screenNumber: "20000",
    children: [
      {
        id: "store-mgmt-list",
        label: "가게관리",
        href: "/stores",
        screenNumber: "20001",
        section: "main",
      },
      {
        id: "store-mgmt-ad-contents",
        label: "광고콘텐츠",
        href: "/ads/contents",
        screenNumber: "20003",
        section: "main",
      },
      {
        id: "store-mgmt-coupons",
        label: "쿠폰관리",
        href: "/coupons",
        screenNumber: "20007",
        section: "main",
      },
    ],
  },

  // ─── 상품관리 (30000) ─────────────────────────────────────────────────────
  {
    id: "product-mgmt",
    label: "상품관리",
    icon: Package,
    section: "main",
    screenNumber: "30000",
    children: [
      {
        id: "product-mgmt-list",
        label: "상품 조회/목록",
        href: "/items",
        screenNumber: "30001",
        section: "main",
      },
      {
        id: "product-mgmt-detail",
        label: "상품설명관리",
        href: "/items/detail",
        screenNumber: "30002",
        section: "main",
      },
      {
        id: "product-mgmt-inventory",
        label: "등록상품 재고관리",
        href: "/inventory",
        screenNumber: "30003",
        section: "main",
      },
      {
        id: "product-mgmt-promotions",
        label: "프로모션 관리",
        href: "/promotions",
        screenNumber: "30004",
        section: "main",
      },
    ],
  },

  // ─── 주문배송 (40000) ─────────────────────────────────────────────────────
  {
    id: "order-delivery",
    label: "주문배송",
    icon: Truck,
    section: "main",
    screenNumber: "40000",
    children: [
      {
        id: "order-delivery-fulfillment",
        label: "주문처리",
        href: "/orders/fulfillment",
        screenNumber: "40000",
        section: "main",
      },
      {
        id: "order-delivery-packing",
        label: "패킹 작업 관리",
        href: "/orders/packing",
        screenNumber: "40002",
        section: "main",
      },
      {
        id: "order-delivery-requests",
        label: "배송관리",
        href: "/shipments/requests",
        screenNumber: "40005",
        section: "main",
      },
    ],
  },

  // ─── 고객지원 (50000) ─────────────────────────────────────────────────────
  {
    id: "customer-support",
    label: "고객지원",
    icon: Headphones,
    section: "main",
    screenNumber: "50000",
    children: [
      {
        id: "customer-support-cs",
        label: "고객 CS",
        href: "/support/cs",
        screenNumber: "50001",
        section: "main",
      },
      {
        id: "customer-support-reviews",
        label: "리뷰관리",
        href: "/support/reviews",
        screenNumber: "50002",
        section: "main",
      },
    ],
  },

  // ─── 시스템관리 (60000) ───────────────────────────────────────────────────
  {
    id: "system-mgmt",
    label: "시스템관리",
    icon: Settings,
    section: "main",
    screenNumber: "60000",
    children: [
      {
        id: "system-mgmt-users",
        label: "사용자 조회/목록",
        href: "/users",
        screenNumber: "60001",
        section: "main",
      },
      {
        id: "system-mgmt-codes",
        label: "공통코드관리",
        href: "/codes",
        screenNumber: "60002",
        section: "main",
      },
      {
        id: "system-mgmt-audit",
        label: "감사로그",
        href: "/audit",
        screenNumber: "60003",
        section: "main",
      },
    ],
  },

  // ─── 링크 메뉴 ─────────────────────────────────────────────────────────────
  {
    id: "analytics",
    label: "통계",
    icon: BarChart3,
    href: "/analytics",
    section: "link",
  },
];

// 노드에서 href를 가진 첫 번째 leaf 탐색 (BFS)
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
