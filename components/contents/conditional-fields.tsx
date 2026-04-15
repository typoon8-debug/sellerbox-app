import { type ReactNode } from "react";

interface ConditionalFieldsProps {
  when: boolean;
  children: ReactNode;
}

export function ConditionalFields({ when, children }: ConditionalFieldsProps) {
  if (!when) return null;
  return <div className="animate-in fade-in-0 slide-in-from-top-1 duration-200">{children}</div>;
}
