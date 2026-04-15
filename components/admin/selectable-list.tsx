import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SelectableItem {
  id: string;
  label: string;
  sublabel?: string;
}

interface SelectableListProps<T extends SelectableItem> {
  items: T[];
  selectedId?: string;
  onSelect: (item: T) => void;
  header?: ReactNode;
  emptyMessage?: string;
  className?: string;
}

/**
 * 마스터-디테일 레이아웃의 좌측 마스터 목록 컴포넌트
 * - hover bg-hover (#F0F0F0), selected bg-primary-light (#E2F3FF) text-primary
 */
export function SelectableList<T extends SelectableItem>({
  items,
  selectedId,
  onSelect,
  header,
  emptyMessage = "목록이 없습니다.",
  className,
}: SelectableListProps<T>) {
  return (
    <div
      className={cn(
        "border-separator bg-control flex flex-col overflow-hidden rounded border",
        className
      )}
    >
      {header && (
        <div className="border-separator bg-panel text-text-placeholder border-b px-3 py-2 text-xs font-medium">
          {header}
        </div>
      )}
      <ScrollArea className="flex-1">
        {items.length === 0 ? (
          <p className="text-text-placeholder p-4 text-center text-xs">{emptyMessage}</p>
        ) : (
          <ul>
            {items.map((item) => {
              const isSelected = item.id === selectedId;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className={cn(
                      "flex w-full flex-col px-3 py-2 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-primary-light text-primary font-semibold"
                        : "text-text-body hover:bg-hover"
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                    {item.sublabel && (
                      <span className="text-text-placeholder text-xs">{item.sublabel}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
