"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { addPromotionItem } from "@/lib/actions/domain/promotion.actions";
import { toastResult } from "@/lib/utils/toast-result";
import type { PromotionRow, PromotionItemRow } from "@/lib/types/domain/promotion";
import { Plus } from "lucide-react";

const columns: DataTableColumn<PromotionItemRow>[] = [
  { key: "id", header: "ID", className: "w-28" },
  { key: "item_id", header: "상품 ID" },
  { key: "promo_id", header: "프로모션 ID" },
  {
    key: "status",
    header: "상태",
    render: (row) => <DomainBadge type="item" status={row.status ?? ""} />,
  },
  {
    key: "condition_qty",
    header: "조건 수량",
    render: (row) => row.condition_qty ?? "-",
  },
  {
    key: "reward_qty",
    header: "보상 수량",
    render: (row) => row.reward_qty ?? "-",
  },
  {
    key: "reward_item_id",
    header: "N+1 대체상품 ID",
    render: (row) => row.reward_item_id ?? "-",
  },
];

interface PromotionItemsClientProps {
  promotions: PromotionRow[];
  initialItems: PromotionItemRow[];
}

export function PromotionItemsClient({ promotions, initialItems }: PromotionItemsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPromo, setSelectedPromo] = useState<string>("");
  const [addOpen, setAddOpen] = useState(false);

  // 폼 상태
  const [itemId, setItemId] = useState("");
  const [rewardItemId, setRewardItemId] = useState("");
  const [conditionQty, setConditionQty] = useState<number>(1);
  const [rewardQty, setRewardQty] = useState<number>(1);

  // 선택된 프로모션의 아이템 필터링
  const filteredItems = selectedPromo
    ? initialItems.filter((item) => item.promo_id === selectedPromo)
    : [];

  // 프로모션 상품 추가 처리
  const handleAdd = async () => {
    if (!selectedPromo || !itemId) return;

    const result = await addPromotionItem({
      promo_id: selectedPromo,
      item_id: itemId,
      condition_qty: conditionQty || null,
      reward_qty: rewardQty || null,
      reward_item_id: rewardItemId || null,
    });
    const ok = toastResult(result, { successMessage: "상품이 프로모션에 추가되었습니다." });
    if (ok) {
      setAddOpen(false);
      setItemId("");
      setRewardItemId("");
      setConditionQty(1);
      setRewardQty(1);
      startTransition(() => router.refresh());
    }
  };

  return (
    <div className="p-6">
      {/* 프로모션 선택 드롭다운 */}
      <div className="mb-4">
        <Select value={selectedPromo} onValueChange={setSelectedPromo}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="프로모션 선택" />
          </SelectTrigger>
          <SelectContent>
            {promotions.map((p) => (
              <SelectItem key={p.promo_id} value={p.promo_id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        rowKey={(row) => row.id}
        searchPlaceholder="상품 ID 검색"
        toolbarActions={
          <Button size="sm" onClick={() => setAddOpen(true)} disabled={!selectedPromo}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            상품 추가
          </Button>
        }
        emptyMessage={selectedPromo ? "적용 상품이 없습니다." : "프로모션을 선택하세요."}
        showRowActions={false}
      />

      {/* 프로모션 상품 추가 다이얼로그 */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로모션 상품 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-id">상품 ID *</Label>
              <Input
                id="item-id"
                placeholder="상품 UUID"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reward-item-id">N+1 대체상품 ID (선택)</Label>
              <Input
                id="reward-item-id"
                placeholder="대체상품 UUID (N+1 조건)"
                value={rewardItemId}
                onChange={(e) => setRewardItemId(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="condition-qty">조건 수량</Label>
                <Input
                  id="condition-qty"
                  type="number"
                  min={1}
                  value={conditionQty}
                  onChange={(e) => setConditionQty(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward-qty">보상 수량</Label>
                <Input
                  id="reward-qty"
                  type="number"
                  min={1}
                  value={rewardQty}
                  onChange={(e) => setRewardQty(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAdd} disabled={isPending || !itemId}>
              {isPending ? "추가 중..." : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
