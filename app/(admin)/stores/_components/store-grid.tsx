"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteStore } from "@/lib/actions/domain/store.actions";
import type { StoreRow } from "@/lib/types/domain/store";
import type { TenantRow } from "@/lib/types/domain/store";

interface StoreGridProps {
  stores: StoreRow[];
  selectedStoreId: string | null;
  selectedTenant: TenantRow | null;
  onStoreSelect: (store: StoreRow) => void;
  onAddStore: () => void;
  onStoreDeleted: (storeId: string) => void;
}

export function StoreGrid({
  stores,
  selectedStoreId,
  selectedTenant,
  onStoreSelect,
  onAddStore,
  onStoreDeleted,
}: StoreGridProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<StoreRow | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteStore({ store_id: deleteTarget.store_id });
    if (!result.ok) {
      toast.error(result.error.message);
      setDeleteTarget(null);
      return;
    }
    toast.success(`'${deleteTarget.name}' 가게가 삭제되었습니다.`);
    onStoreDeleted(deleteTarget.store_id);
    setDeleteTarget(null);
    router.refresh();
  };

  return (
    <div className="border-separator border-b p-4">
      {/* 툴바 */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-text-body text-sm font-medium">
          가게 목록
          {selectedTenant && (
            <span className="text-text-placeholder ml-1">— {selectedTenant.name}</span>
          )}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline-gray" onClick={onAddStore} disabled={!selectedTenant}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            행추가
          </Button>
          <Button
            size="sm"
            variant="outline-gray"
            onClick={() =>
              selectedStoreId &&
              setDeleteTarget(stores.find((s) => s.store_id === selectedStoreId) ?? null)
            }
            disabled={!selectedStoreId}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            행삭제
          </Button>
          <span className="text-text-placeholder text-xs">전체 {stores.length}개</span>
        </div>
      </div>

      {/* 가게 Grid */}
      <ScrollArea className="h-[160px]">
        <div className="border-separator rounded border">
          <Table>
            <TableHeader>
              <TableRow className="bg-panel">
                <TableHead className="w-52">가게 ID</TableHead>
                <TableHead>가게이름</TableHead>
                <TableHead className="w-24">가게유형</TableHead>
                <TableHead>주소</TableHead>
                <TableHead className="w-32">전화번호</TableHead>
                <TableHead className="w-24">최소주문금액</TableHead>
                <TableHead className="w-20">배달팁</TableHead>
                <TableHead className="w-20">상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!selectedTenant ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-text-placeholder py-6 text-center text-sm">
                    테넌트를 먼저 선택해 주세요.
                  </TableCell>
                </TableRow>
              ) : stores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-text-placeholder py-6 text-center text-sm">
                    등록된 가게가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                stores.map((store) => (
                  <TableRow
                    key={store.store_id}
                    onClick={() => onStoreSelect(store)}
                    className={`cursor-pointer ${
                      selectedStoreId === store.store_id ? "bg-primary-light" : "hover:bg-hover"
                    }`}
                  >
                    <TableCell className="font-mono text-xs">{store.store_id}</TableCell>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>{store.store_category}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{store.address}</TableCell>
                    <TableCell>{store.phone}</TableCell>
                    <TableCell>{store.min_delivery_price.toLocaleString()}원</TableCell>
                    <TableCell>{store.delivery_tip.toLocaleString()}원</TableCell>
                    <TableCell>
                      <DomainBadge type="store" status={store.status ?? ""} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="가게 삭제"
        description={`'${deleteTarget?.name}' 가게를 삭제하시겠습니까?`}
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
