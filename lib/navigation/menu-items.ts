import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Users,
  Code2,
  Megaphone,
  Settings,
  Star,
  Store,
  Package,
  Warehouse,
  ShoppingCart,
  Truck,
  Tag,
  Ticket,
  BarChart3,
  Headphones,
  ScrollText,
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
  // ─── 즐겨찾기 ──────────────────────────────────────────────────────────────
  {
    id: "fav-tenants",
    label: "테넌트 관리",
    icon: Building2,
    href: "/tenants",
    screenNumber: "10001",
    section: "favorite",
  },

  // ─── 메인 업무 메뉴 ────────────────────────────────────────────────────────

  // 가게 관리 (F012·F013)
  {
    id: "stores",
    label: "가게 관리",
    icon: Store,
    section: "main",
    screenNumber: "12000",
    children: [
      {
        id: "stores-list",
        label: "가게 조회/목록",
        href: "/stores",
        screenNumber: "12001",
        section: "main",
      },
      {
        id: "stores-info",
        label: "가게 정보 관리",
        href: "/stores/info",
        screenNumber: "12002",
        section: "main",
      },
    ],
  },

  // 상품 관리 (F001)
  {
    id: "items",
    label: "상품 관리",
    icon: Package,
    section: "main",
    screenNumber: "11000",
    children: [
      {
        id: "items-list",
        label: "상품 조회/목록",
        href: "/items",
        screenNumber: "11001",
        section: "main",
      },
    ],
  },

  // 재고 관리 (F002)
  {
    id: "inventory",
    label: "재고 관리",
    icon: Warehouse,
    section: "main",
    screenNumber: "21000",
    children: [
      {
        id: "inventory-list",
        label: "등록상품 재고관리",
        href: "/inventory",
        screenNumber: "21001",
        section: "main",
      },
    ],
  },

  // 주문 처리 (F003~F006)
  {
    id: "orders",
    label: "주문 처리",
    icon: ShoppingCart,
    section: "main",
    screenNumber: "31000",
    children: [
      {
        id: "orders-picking",
        label: "피킹 작업 관리",
        href: "/orders/picking",
        screenNumber: "31001",
        section: "main",
      },
      {
        id: "orders-packing",
        label: "패킹 작업 관리",
        href: "/orders/packing",
        screenNumber: "31002",
        section: "main",
      },
      {
        id: "orders-labels",
        label: "라벨 관리",
        href: "/orders/labels",
        screenNumber: "31003",
        section: "main",
      },
      {
        id: "orders-print",
        label: "피킹/패킹 리스트 출력",
        href: "/orders/print",
        screenNumber: "31004",
        section: "main",
      },
    ],
  },

  // 배송 관리 (F007~F010)
  {
    id: "shipments",
    label: "배송 관리",
    icon: Truck,
    section: "main",
    screenNumber: "41000",
    children: [
      {
        id: "shipments-requests",
        label: "배송 요청 관리",
        href: "/shipments/requests",
        screenNumber: "41001",
        section: "main",
      },
      {
        id: "shipments-quick-closing",
        label: "바로퀵 마감",
        href: "/shipments/quick-closing",
        screenNumber: "41002",
        section: "main",
      },
      {
        id: "shipments-routing",
        label: "배송 라우팅",
        href: "/shipments/routing",
        screenNumber: "41003",
        section: "main",
      },
      {
        id: "shipments-dashboard",
        label: "배송 현황판",
        href: "/shipments/dashboard",
        screenNumber: "41004",
        section: "main",
      },
    ],
  },

  // 프로모션 (F014·F015)
  {
    id: "promotions",
    label: "프로모션",
    icon: Tag,
    section: "main",
    screenNumber: "50000",
    children: [
      {
        id: "promotions-list",
        label: "프로모션 관리",
        href: "/promotions",
        screenNumber: "50001",
        section: "main",
      },
      {
        id: "promotions-items",
        label: "프로모션 상품 관리",
        href: "/promotions/items",
        screenNumber: "50002",
        section: "main",
      },
    ],
  },

  // 쿠폰 관리 (F016·F017)
  {
    id: "coupons",
    label: "쿠폰 관리",
    icon: Ticket,
    section: "main",
    screenNumber: "60000",
    children: [
      {
        id: "coupons-list",
        label: "쿠폰 관리",
        href: "/coupons",
        screenNumber: "60001",
        section: "main",
      },
      {
        id: "coupons-issuances",
        label: "쿠폰 발급 조회",
        href: "/coupons/issuances",
        screenNumber: "60002",
        section: "main",
      },
    ],
  },

  // 광고 관리 (F018~F022)
  {
    id: "ads",
    label: "광고 관리",
    icon: Megaphone,
    section: "main",
    screenNumber: "70000",
    children: [
      {
        id: "ads-contents",
        label: "광고 콘텐츠",
        href: "/ads/contents",
        screenNumber: "70001",
        section: "main",
      },
      {
        id: "ads-schedules",
        label: "광고 일정",
        href: "/ads/schedules",
        screenNumber: "70002",
        section: "main",
      },
      {
        id: "ads-targets",
        label: "광고 타겟",
        href: "/ads/targets",
        screenNumber: "70003",
        section: "main",
      },
      {
        id: "ads-caps",
        label: "광고 한도",
        href: "/ads/caps",
        screenNumber: "70004",
        section: "main",
      },
      {
        id: "ads-logs",
        label: "광고 로그",
        href: "/ads/logs",
        screenNumber: "70005",
        section: "main",
      },
    ],
  },

  // 고객 지원 (F023·F024)
  {
    id: "support",
    label: "고객 지원",
    icon: Headphones,
    section: "main",
    screenNumber: "80000",
    children: [
      {
        id: "support-cs",
        label: "CS 관리",
        href: "/support/cs",
        screenNumber: "80001",
        section: "main",
      },
      {
        id: "support-reviews",
        label: "리뷰 관리",
        href: "/support/reviews",
        screenNumber: "80002",
        section: "main",
      },
    ],
  },

  // ─── 플랫폼 관리 (스타터킷 기존 항목) ─────────────────────────────────────
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

  // 시스템 관리 (감사 로그)
  {
    id: "system",
    label: "시스템 관리",
    icon: ScrollText,
    section: "main",
    screenNumber: "90000",
    children: [
      {
        id: "audit",
        label: "감사 로그",
        href: "/audit",
        screenNumber: "90010",
        section: "main",
      },
    ],
  },

  // ─── 링크 메뉴 ─────────────────────────────────────────────────────────────
  {
    id: "settings",
    label: "설정",
    icon: Settings,
    href: "/settings",
    screenNumber: "90001",
    section: "link",
  },

  // 통계 (확장용)
  {
    id: "analytics",
    label: "통계",
    icon: BarChart3,
    href: "/analytics",
    screenNumber: "90002",
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
