"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { DomainBadge } from "@/components/admin/domain/status-badge-map";
import { createDispatchRequest } from "@/lib/actions/domain/shipment.actions";
import { toastResult } from "@/lib/utils/toast-result";
import type { DispatchRequestRow } from "@/lib/types/domain/shipment";
import { Plus } from "lucide-react";

const columns: DataTableColumn<DispatchRequestRow>[] = [
  { key: "dispatch_id", header: "요청 ID", className: "w-28" },
  { key: "order_id", header: "주문 ID" },
  {
    key: "status",
    header: "상태",
    render: (row) => <DomainBadge type="dispatchRequest" status={row.status ?? ""} />,
  },
  {
    key: "requested_at",
    header: "요청일시",
    render: (row) => row.requested_at?.slice(0, 16).replace("T", " ") ?? "-",
  },
  { key: "rider_id", header: "배달기사", render: (row) => row.rider_id ?? "-" },
];

interface RequestsClientProps {
  initialData: DispatchRequestRow[];
}

export function RequestsClient({ initialData }: RequestsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [storeId, setStoreId] = useState("");

  // 배송 요청 생성 처리
  const handleCreate = async () => {
    const result = await createDispatchRequest({ order_id: orderId, store_id: storeId });
    const ok = toastResult(result, { successMessage: "배송 요청이 생성되었습니다." });
    if (ok) {
      setIsDialogOpen(false);
      setOrderId("");
      setStoreId("");
      startTransition(() => router.refresh());
    }
  };

  const handleOpenDialog = () => {
    setOrderId("");
    setStoreId("");
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={initialData}
        rowKey={(row) => row.dispatch_id}
        searchPlaceholder="요청 ID·주문 ID 검색"
        toolbarActions={
          <Button size="sm" onClick={handleOpenDialog}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            배송 요청 생성
          </Button>
        }
        showRowActions={false}
      />

      {/* 배송 요청 생성 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>배송 요청 생성</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="order-id">주문 ID</Label>
              <Input
                id="order-id"
                placeholder="주문 UUID 입력"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-id">가게 ID</Label>
              <Input
                id="store-id"
                placeholder="가게 UUID 입력"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreate} disabled={isPending || !orderId || !storeId}>
              {isPending ? "생성 중..." : "생성"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
