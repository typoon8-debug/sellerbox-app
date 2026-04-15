"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { LayerDialog } from "@/components/admin/layer-dialog";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { MOCK_PROMOTIONS } from "@/lib/mocks/promotion";
import { MOCK_ITEMS } from "@/lib/mocks/item";
import type { ItemRow } from "@/lib/types/domain/item";
import { Plus } from "lucide-react";

const columns: DataTableColumn<ItemRow>[] = [
  { key: "sku", header: "SKU", className: "w-28" },
  { key: "name", header: "상품명" },
  { key: "category_name", header: "카테고리" },
  {
    key: "status",
    header: "상태",
    render: (row) => <DomainBadge type="item" status={row.status ?? ""} />,
  },
];

export function PromotionItemsClient() {
  const [selectedPromo, setSelectedPromo] = useState<string>("");
  const [addOpen, setAddOpen] = useState(false);

  const handleAdd = () => {
    toast.success("상품이 프로모션에 추가되었습니다.");
    setAddOpen(false);
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
            {MOCK_PROMOTIONS.map((p) => (
              <SelectItem key={p.promo_id} value={p.promo_id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={selectedPromo ? MOCK_ITEMS.slice(0, 3) : []}
        rowKey={(row) => row.item_id}
        searchPlaceholder="상품명 검색"
        toolbarActions={
          <Button size="sm" onClick={() => setAddOpen(true)} disabled={!selectedPromo}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            상품 추가
          </Button>
        }
        emptyMessage={selectedPromo ? "적용 상품이 없습니다." : "프로모션을 선택하세요."}
        showRowActions={false}
      />

      <LayerDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="프로모션 상품 추가"
        size="md"
        onConfirm={handleAdd}
        confirmLabel="추가"
      >
        <div className="p-4">
          <DataTable
            columns={columns}
            data={MOCK_ITEMS}
            rowKey={(row) => row.item_id}
            searchPlaceholder="추가할 상품 검색"
            showRowActions={false}
          />
        </div>
      </LayerDialog>
    </div>
  );
}
