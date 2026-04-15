"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* 가이드 §10 메뉴검색 규격
 * Height: 44px, Radius: 4px
 * Normal: bg #F5F6F8
 * Hover: bg #F0F0F0
 * Selected(focused): outline #2E85FF bg #F5F6F8
 * Placeholder / Icon: #6C6C6C, Font: #353535 */
interface MenuSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MenuSearchInput({
  value,
  onChange,
  placeholder = "메뉴 검색",
  className,
}: MenuSearchInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div
      className={cn(
        "relative flex h-11 items-center rounded border border-transparent px-2",
        "bg-panel hover:bg-hover",
        "focus-within:border-primary focus-within:bg-panel",
        "transition-colors",
        className
      )}
    >
      <Search className="text-text-placeholder mr-1.5 h-4 w-4 shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "text-text-body flex-1 bg-transparent text-sm outline-none",
          "placeholder:text-text-placeholder"
        )}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="text-text-placeholder hover:text-text-body ml-1 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
