"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { LayerDialog } from "@/components/admin/layer-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { createAdTarget, updateAdTarget, deleteAdTarget } from "@/lib/actions/domain/ad.actions";
import type { AdTargetRow, AdCapRow } from "@/lib/types/domain/advertisement";

// 타겟 + 한도 통합 행 타입
type TargetWithCap = AdTargetRow & {
  max_impressions_total?: number | null;
  max_impressions_per_user_day?: number | null;
  max_clicks_total?: number | null;
  cap_id?: string;
};

const formSchema = z.object({
  os: z.enum(["IOS", "ANDROID", "WEB"]).optional().nullable(),
  app_version_min: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  user_segment: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  max_impressions_total: z.number().int().min(0).optional().nullable(),
  max_impressions_per_user_day: z.number().int().min(0).optional().nullable(),
  max_clicks_total: z.number().int().min(0).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface TargetTabProps {
  contentId: string;
  storeId: string;
  targets: AdTargetRow[];
  caps: AdCapRow[];
  onDataChange: (targets: AdTargetRow[], caps: AdCapRow[]) => void;
}

export function TargetTab({ contentId, storeId, targets, caps, onDataChange }: TargetTabProps) {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TargetWithCap | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdTargetRow | null>(null);

  // 타겟 행과 한도 데이터를 병합
  const rows: TargetWithCap[] = targets.map((t) => {
    const cap = caps.find((c) => c.content_id === t.content_id);
    return {
      ...t,
      max_impressions_total: cap?.max_impressions_total ?? null,
      max_impressions_per_user_day: cap?.max_impressions_per_user_day ?? null,
      max_clicks_total: cap?.max_clicks_total ?? null,
      cap_id: cap?.cap_id,
    };
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      os: null,
      app_version_min: "",
      region: "",
      locale: "",
      user_segment: "",
      status: "ACTIVE",
      max_impressions_total: null,
      max_impressions_per_user_day: null,
      max_clicks_total: null,
    },
  });

  const columns: DataTableColumn<TargetWithCap>[] = [
    {
      key: "target_id",
      header: "타겟ID",
      className: "w-28 truncate text-xs text-muted-foreground",
    },
    { key: "os", header: "OS", render: (row) => row.os ?? "전체" },
    { key: "app_version_min", header: "최소버전", render: (row) => row.app_version_min ?? "-" },
    { key: "region", header: "지역", render: (row) => row.region ?? "-" },
    {
      key: "max_impressions_total",
      header: "총노출한도",
      render: (row) => row.max_impressions_total?.toLocaleString() ?? "-",
    },
    {
      key: "max_impressions_per_user_day",
      header: "1일/인 노출",
      render: (row) => row.max_impressions_per_user_day?.toLocaleString() ?? "-",
    },
    {
      key: "max_clicks_total",
      header: "총클릭한도",
      render: (row) => row.max_clicks_total?.toLocaleString() ?? "-",
    },
    { key: "status", header: "상태" },
  ];

  const openRegister = () => {
    form.reset({
      os: null,
      app_version_min: "",
      region: "",
      locale: "",
      user_segment: "",
      status: "ACTIVE",
      max_impressions_total: null,
      max_impressions_per_user_day: null,
      max_clicks_total: null,
    });
    setRegisterOpen(true);
  };

  const openEdit = (row: TargetWithCap) => {
    form.reset({
      os: row.os ?? null,
      app_version_min: row.app_version_min ?? "",
      region: row.region ?? "",
      locale: row.locale ?? "",
      user_segment: row.user_segment ?? "",
      status: row.status as FormValues["status"],
      max_impressions_total: row.max_impressions_total ?? null,
      max_impressions_per_user_day: row.max_impressions_per_user_day ?? null,
      max_clicks_total: row.max_clicks_total ?? null,
    });
    setEditTarget(row);
  };

  const handleSubmit = async (values: FormValues) => {
    if (editTarget) {
      const result = await updateAdTarget({
        target_id: editTarget.target_id,
        content_id: contentId,
        ...values,
      });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("타겟이 수정되었습니다.");
      onDataChange(
        targets.map((t) =>
          t.target_id === editTarget.target_id ? (result.data as AdTargetRow) : t
        ),
        caps
      );
      setEditTarget(null);
    } else {
      const result = await createAdTarget({
        content_id: contentId,
        store_id: storeId,
        ...values,
      });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success("타겟이 등록되었습니다.");
      onDataChange([...targets, result.data as AdTargetRow], caps);
      setRegisterOpen(false);
    }
    form.reset();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteAdTarget({ target_id: deleteTarget.target_id });
    if (!result.ok) {
      toast.error(result.error.message);
      setDeleteTarget(null);
      return;
    }
    toast.success("타겟이 삭제되었습니다.");
    onDataChange(
      targets.filter((t) => t.target_id !== deleteTarget.target_id),
      caps
    );
    setDeleteTarget(null);
  };

  const isDialogOpen = registerOpen || editTarget !== null;

  return (
    <div>
      <DataTable
        columns={columns}
        data={rows}
        rowKey={(row) => row.target_id}
        toolbarActions={
          <Button size="sm" variant="outline-gray" onClick={openRegister}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            타겟 추가
          </Button>
        }
        showRowActions
        onRowEdit={openEdit}
        onRowDelete={(row) => setDeleteTarget(row)}
        emptyMessage="등록된 타겟이 없습니다."
      />

      <LayerDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRegisterOpen(false);
            setEditTarget(null);
          }
        }}
        title={editTarget ? "타겟 수정" : "타겟 추가"}
        onConfirm={form.handleSubmit(handleSubmit)}
        confirmLabel={editTarget ? "수정" : "추가"}
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="os"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OS</FormLabel>
                    <Select
                      value={field.value ?? "__ALL__"}
                      onValueChange={(v) => field.onChange(v === "__ALL__" ? null : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__ALL__">전체</SelectItem>
                        <SelectItem value="IOS">IOS</SelectItem>
                        <SelectItem value="ANDROID">ANDROID</SelectItem>
                        <SelectItem value="WEB">WEB</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="app_version_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>최소 앱버전</FormLabel>
                    <FormControl>
                      <Input placeholder="1.0.0" {...field} value={field.value ?? ""} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>지역 (region)</FormLabel>
                    <FormControl>
                      <Input placeholder="KR" {...field} value={field.value ?? ""} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="locale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>로케일 (locale)</FormLabel>
                    <FormControl>
                      <Input placeholder="ko-KR" {...field} value={field.value ?? ""} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="user_segment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사용자 세그먼트</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="NEW_USER, VIP_USER ..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* 한도 필드 */}
            <div className="space-y-3 rounded-md border p-3">
              <p className="text-muted-foreground text-sm font-medium">노출·클릭 한도 (0=무제한)</p>
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="max_impressions_total"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">총 노출 한도</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="무제한"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? null : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="max_impressions_per_user_day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">1일/인 노출</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="무제한"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? null : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="max_clicks_total"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">총 클릭 한도</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="무제한"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? null : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상태</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">활성</SelectItem>
                      <SelectItem value="INACTIVE">비활성</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </LayerDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="타겟 삭제"
        description="이 타겟을 삭제하시겠습니까?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
