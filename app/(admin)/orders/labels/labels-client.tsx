"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer } from "lucide-react";
import { updateLabelPrintedAt } from "@/lib/actions/domain/fulfillment.actions";
import { generateZpl } from "@/lib/utils/zpl-generator";
import type { Database } from "@/lib/supabase/database.types";

type LabelRow = Database["public"]["Tables"]["label"]["Row"];
type LabelType = "BOX" | "BAG" | "INVOICE";

const LABEL_TYPES: { value: LabelType; label: string }[] = [
  { value: "BOX", label: "박스 라벨" },
  { value: "BAG", label: "봉투 라벨" },
  { value: "INVOICE", label: "송장 라벨" },
];

interface LabelsClientProps {
  initialData: LabelRow[];
}

export function LabelsClient({ initialData }: LabelsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedTypes, setSelectedTypes] = useState<Set<LabelType>>(new Set());
  const [selectedLabelIds, setSelectedLabelIds] = useState<Set<string>>(new Set());

  const toggleType = (type: LabelType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds((prev) => {
      const next = new Set(prev);
      if (next.has(labelId)) next.delete(labelId);
      else next.add(labelId);
      return next;
    });
  };

  // 선택된 라벨 × 선택된 유형 조합으로 ZPL 생성 (미리보기)
  const zplPreview =
    selectedLabelIds.size > 0 && selectedTypes.size > 0
      ? Array.from(selectedLabelIds)
          .flatMap((labelId) => {
            const label = initialData.find((l) => l.label_id === labelId);
            if (!label) return [];
            return Array.from(selectedTypes).map((type) =>
              generateZpl(type, {
                orderNo: label.order_id,
                printedAt: undefined, // 미리보기는 현재 시각 사용
              })
            );
          })
          .join("\n\n---\n\n")
      : "";

  // 라벨 출력 — printed_at 갱신 후 window.print()
  const handlePrint = () => {
    if (selectedLabelIds.size === 0 || selectedTypes.size === 0) return;

    startTransition(async () => {
      // 선택된 각 라벨의 printed_at 갱신
      const updateResults = await Promise.all(
        Array.from(selectedLabelIds).map((labelId) => updateLabelPrintedAt({ label_id: labelId }))
      );

      const hasError = updateResults.some((r) => !r.ok);
      if (hasError) {
        toast.error("일부 라벨 출력 시각 갱신에 실패했습니다.");
      } else {
        toast.success(`${selectedLabelIds.size}건 × ${selectedTypes.size}종 라벨 출력 완료`);
        // 브라우저 인쇄 다이얼로그 열기
        window.print();
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* 라벨 유형 선택 */}
      <div>
        <h3 className="mb-3 text-sm font-medium">라벨 유형 선택</h3>
        <div className="flex gap-4">
          {LABEL_TYPES.map((lt) => (
            <div key={lt.value} className="flex items-center gap-2">
              <Checkbox
                id={lt.value}
                checked={selectedTypes.has(lt.value)}
                onCheckedChange={() => toggleType(lt.value)}
              />
              <Label htmlFor={lt.value}>{lt.label}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* 라벨 목록 선택 */}
      <div>
        <h3 className="mb-3 text-sm font-medium">
          라벨 선택{" "}
          <span className="text-muted-foreground font-normal">(총 {initialData.length}건)</span>
        </h3>
        {initialData.length === 0 ? (
          <p className="text-muted-foreground text-sm">등록된 라벨이 없습니다.</p>
        ) : (
          <div className="border-separator divide-separator divide-y rounded border">
            {initialData.map((label) => (
              <div key={label.label_id} className="flex items-center gap-3 px-4 py-2.5">
                <Checkbox
                  id={`label-${label.label_id}`}
                  checked={selectedLabelIds.has(label.label_id)}
                  onCheckedChange={() => toggleLabel(label.label_id)}
                />
                <Label
                  htmlFor={`label-${label.label_id}`}
                  className="flex flex-1 cursor-pointer items-center gap-3"
                >
                  <span className="w-40 truncate text-xs font-medium">{label.label_id}</span>
                  <span className="text-text-placeholder w-40 truncate text-sm">
                    주문: {label.order_id}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {label.label_type}
                  </Badge>
                </Label>
                {label.printed_at ? (
                  <Badge variant="secondary" className="text-xs">
                    출력됨 {label.printed_at.slice(0, 10)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    미출력
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ZPL 미리보기 */}
      {zplPreview && (
        <div>
          <h3 className="mb-2 text-sm font-medium">ZPL 미리보기</h3>
          <Textarea value={zplPreview} readOnly rows={12} className="font-mono text-xs" />
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handlePrint}
          disabled={selectedLabelIds.size === 0 || selectedTypes.size === 0 || isPending}
        >
          <Printer className="mr-2 h-4 w-4" />
          {isPending ? "처리 중..." : "라벨 출력"}
        </Button>
      </div>
    </div>
  );
}
