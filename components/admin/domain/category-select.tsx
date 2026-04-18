"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type CategoryOption = { value: string; label: string };

// ─── 더미 카테고리 데이터 (레거시 하드코딩 — 점진적으로 common_code DB로 대체) ──
export const STORE_CATEGORIES = [
  { value: "KOREAN", label: "한식" },
  { value: "CHINESE", label: "중식" },
  { value: "JAPANESE", label: "일식" },
  { value: "WESTERN", label: "양식" },
  { value: "CAFE", label: "카페/디저트" },
  { value: "CHICKEN", label: "치킨" },
  { value: "PIZZA", label: "피자" },
  { value: "BURGER", label: "버거" },
  { value: "SNACK", label: "분식" },
  { value: "SEAFOOD", label: "해산물" },
];

export const ITEM_CATEGORIES = [
  { value: "VEGETABLE", label: "채소/나물" },
  { value: "FRUIT", label: "과일" },
  { value: "MEAT", label: "육류" },
  { value: "SEAFOOD", label: "수산물" },
  { value: "DAIRY", label: "유제품/달걀" },
  { value: "GRAIN", label: "곡류/면류" },
  { value: "SAUCE", label: "소스/양념" },
  { value: "FROZEN", label: "냉동식품" },
  { value: "BEVERAGE", label: "음료" },
  { value: "SNACK", label: "과자/간식" },
];

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  categories?: CategoryOption[];
  placeholder?: string;
  allLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function CategorySelect({
  value,
  onValueChange,
  categories = ITEM_CATEGORIES,
  placeholder = "카테고리",
  allLabel = "전체",
  disabled,
  className,
}: CategorySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={cn("h-8 w-40", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">{allLabel}</SelectItem>
        {categories.map((cat) => (
          <SelectItem key={cat.value} value={cat.value}>
            {cat.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
