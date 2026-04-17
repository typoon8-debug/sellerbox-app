"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { QueryField } from "@/components/admin/query-field";
import { QueryActions } from "@/components/admin/query-actions";
import { ContentRegisterDialog } from "@/app/(admin)/ads/contents/_components/content-register-dialog";
import {
  AdContentTabs,
  type AdContentTabData,
} from "@/app/(admin)/ads/contents/_components/ad-content-tabs";
import {
  fetchAdContentsByStore,
  softDeleteAdContent,
  fetchAdContentTabs,
} from "@/lib/actions/domain/ad.actions";
import type { AdContentRow } from "@/lib/types/domain/advertisement";

const AD_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "초안", className: "bg-disabled text-text-placeholder border-separator" },
  READY: { label: "준비", className: "bg-blue-50 text-blue-700 border-blue-200" },
  ACTIVE: { label: "활성", className: "bg-primary-light text-primary border-primary/30" },
  PAUSED: { label: "일시정지", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  ENDED: { label: "종료", className: "bg-alert-red-bg text-alert-red border-alert-red/30" },
};

const AD_PLACEMENT_LABELS: Record<string, string> = {
  HERO: "HERO (히어로)",
  MID_1: "MID_1 (중단1)",
  MID_2: "MID_2 (중단2)",
  FOOTER: "FOOTER (하단)",
};

const EMPTY_TAB_DATA: AdContentTabData = {
  schedules: [],
  targets: [],
  caps: [],
  logs: [],
};

interface AdsContentsClientProps {
  stores: { store_id: string; name: string }[];
  initialStoreId: string;
  initialContents: AdContentRow[];
}

export function AdsContentsClient({
  stores,
  initialStoreId,
  initialContents,
}: AdsContentsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 검색조건 상태
  const [selectedStoreId, setSelectedStoreId] = useState(initialStoreId);

  // Panel 1 상태
  const [contents, setContents] = useState<AdContentRow[]>(initialContents);
  const [activeContentId, setActiveContentId] = useState<string | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editContent, setEditContent] = useState<AdContentRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdContentRow | null>(null);

  // Panel 2 탭 상태
  const [tabData, setTabData] = useState<AdContentTabData>(EMPTY_TAB_DATA);
  const [tabLoading, setTabLoading] = useState(false);

  // ─── 검색 ───────────────────────────────────────────────────────────────────
  const handleSearch = () => {
    if (!selectedStoreId) {
      toast.error("가게를 선택하세요.");
      return;
    }
    startTransition(async () => {
      const result = await fetchAdContentsByStore({ store_id: selectedStoreId });
      if (!result.ok) {
        toast.error(result.error.message ?? "조회 실패");
        return;
      }
      setContents(result.data as AdContentRow[]);
      setActiveContentId(null);
      setTabData(EMPTY_TAB_DATA);
    });
  };

  const handleReset = () => {
    setSelectedStoreId(stores[0]?.store_id ?? "");
    router.refresh();
  };

  // ─── Panel 1: 콘텐츠 행 클릭 → Panel 2 탭 데이터 로드 ─────────────────────
  const handleRowClick = useCallback(
    async (row: AdContentRow) => {
      if (row.content_id === activeContentId) return;
      setActiveContentId(row.content_id);
      setTabLoading(true);
      setTabData(EMPTY_TAB_DATA);

      const result = await fetchAdContentTabs({ content_id: row.content_id });
      setTabLoading(false);
      if (!result.ok) {
        toast.error("탭 데이터 로딩 실패");
        return;
      }
      setTabData(result.data as AdContentTabData);
    },
    [activeContentId]
  );

  // ─── Panel 1: 등록/수정/삭제 ────────────────────────────────────────────────
  const handleContentSuccess = (row: AdContentRow) => {
    if (editContent) {
      setContents((prev) => prev.map((c) => (c.content_id === row.content_id ? row : c)));
    } else {
      setContents((prev) => [row, ...prev]);
    }
    setEditContent(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await softDeleteAdContent({ content_id: deleteTarget.content_id });
    if (!result.ok) {
      toast.error(result.error.message ?? "삭제 실패");
      setDeleteTarget(null);
      return;
    }
    toast.success("광고 콘텐츠가 삭제(종료)되었습니다.");
    setContents((prev) => prev.filter((c) => c.content_id !== deleteTarget.content_id));
    if (activeContentId === deleteTarget.content_id) {
      setActiveContentId(null);
      setTabData(EMPTY_TAB_DATA);
    }
    setDeleteTarget(null);
  };

  // ─── Panel 2 탭 데이터 변경 ────────────────────────────────────────────────
  const handleTabDataChange = useCallback((partial: Partial<AdContentTabData>) => {
    setTabData((prev) => ({ ...prev, ...partial }));
  }, []);

  // ─── 컬럼 정의 ──────────────────────────────────────────────────────────────
  const columns: DataTableColumn<AdContentRow>[] = [
    {
      key: "content_id",
      header: "콘텐츠ID",
      className: "w-28 truncate text-xs text-muted-foreground",
    },
    { key: "title", header: "제목" },
    {
      key: "placement_id",
      header: "광고위치",
      render: (row) => AD_PLACEMENT_LABELS[row.placement_id] ?? row.placement_id,
    },
    {
      key: "status",
      header: "상태",
      render: (row) => {
        const cfg = AD_STATUS_CONFIG[row.status ?? ""] ?? { label: row.status, className: "" };
        return (
          <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>
            {cfg.label}
          </Badge>
        );
      },
    },
    { key: "priority", header: "우선순위", render: (row) => `${row.priority}` },
  ];

  const activeContent = contents.find((c) => c.content_id === activeContentId) ?? null;

  return (
    <div className="flex h-full flex-col gap-0">
      {/* 검색조건 영역 */}
      <div className="bg-muted/30 flex flex-wrap items-end gap-3 border-b p-4">
        <QueryField label="가게명" required>
          {stores.length === 0 ? (
            <p className="text-muted-foreground text-sm">소속 가게 없음</p>
          ) : (
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="가게 선택" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((s) => (
                  <SelectItem key={s.store_id} value={s.store_id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </QueryField>
        <QueryActions onSearch={handleSearch} onReset={handleReset} loading={isPending} />
      </div>

      {/* 2-패널 MDI 영역 */}
      <div className="flex min-h-0 flex-1 flex-col divide-y">
        {/* Panel 1: 광고 콘텐츠 그리드 */}
        <div className="min-h-0 overflow-auto p-4" style={{ flex: "0 0 auto", maxHeight: "40vh" }}>
          <DataTable
            columns={columns}
            data={contents}
            rowKey={(row) => row.content_id}
            activeRowKey={activeContentId ?? undefined}
            onRowClick={handleRowClick}
            toolbarActions={
              <Button
                size="sm"
                onClick={() => {
                  setEditContent(null);
                  setRegisterOpen(true);
                }}
                disabled={!selectedStoreId}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                콘텐츠 등록
              </Button>
            }
            showRowActions
            onRowEdit={(row) => {
              setEditContent(row);
              setRegisterOpen(true);
            }}
            onRowDelete={(row) => setDeleteTarget(row)}
            emptyMessage="조회 조건을 설정하고 조회 버튼을 클릭하세요."
          />
        </div>

        {/* Panel 2: 탭 (콘텐츠 선택 시 표시) */}
        <div className="min-h-0 flex-1 overflow-auto">
          {activeContentId ? (
            tabLoading ? (
              <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
                탭 데이터 로딩 중...
              </div>
            ) : (
              <AdContentTabs
                contentId={activeContentId}
                storeId={activeContent?.store_id ?? selectedStoreId}
                tabData={tabData}
                onTabDataChange={handleTabDataChange}
              />
            )
          ) : (
            <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
              콘텐츠를 선택하면 일정·타겟·로그를 관리할 수 있습니다.
            </div>
          )}
        </div>
      </div>

      {/* 등록/수정 다이얼로그 */}
      <ContentRegisterDialog
        open={registerOpen}
        onOpenChange={(open) => {
          setRegisterOpen(open);
          if (!open) setEditContent(null);
        }}
        storeId={selectedStoreId}
        editTarget={editContent}
        onSuccess={handleContentSuccess}
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="광고 콘텐츠 삭제"
        description={`'${deleteTarget?.title}' 콘텐츠를 삭제(종료 처리)하시겠습니까?`}
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
