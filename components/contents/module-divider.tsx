import { Separator } from "@/components/ui/separator";

interface ModuleDividerProps {
  label?: string;
}

export function ModuleDivider({ label }: ModuleDividerProps) {
  if (!label) return <Separator className="my-4" />;

  return (
    <div className="relative my-4 flex items-center">
      <Separator className="flex-1" />
      <span className="text-muted-foreground mx-3 shrink-0 text-xs font-medium">{label}</span>
      <Separator className="flex-1" />
    </div>
  );
}
