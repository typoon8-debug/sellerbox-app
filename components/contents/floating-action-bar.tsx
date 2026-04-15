import { type ReactNode } from "react";

interface FloatingActionBarProps {
  children: ReactNode;
}

export function FloatingActionBar({ children }: FloatingActionBarProps) {
  return (
    <div className="bg-panel border-separator sticky bottom-0 z-20 flex h-20 shrink-0 items-center justify-end gap-2 border-t px-5 py-4">
      {children}
    </div>
  );
}
