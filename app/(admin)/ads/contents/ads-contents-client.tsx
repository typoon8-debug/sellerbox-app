"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { LayerDialog } from "@/components/admin/layer-dialog";
import { ImageUploader } from "@/components/admin/image-uploader";
import { MOCK_AD_CONTENTS } from "@/lib/mocks/ad";
import type { AdContentRow } from "@/lib/types/domain/advertisement";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

const AD_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "초안", className: "bg-disabled text-text-placeholder border-separator" },
  READY: { label: "준비", className: "bg-blue-50 text-blue-700 border-blue-200" },
  ACTIVE: { label: "활성", className: "bg-primary-light text-primary border-primary/30" },
  PAUSED: { label: "일시정지", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  ENDED: { label: "종료", className: "bg-alert-red-bg text-alert-red border-alert-red/30" },
};

const contentFormSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요"),
  click_url: z.string().optional(),
  ad_image: z.string().nullable(),
});

type ContentFormValues = z.infer<typeof contentFormSchema>;

const columns: DataTableColumn<AdContentRow>[] = [
  { key: "content_id", header: "콘텐츠 ID", className: "w-32" },
  { key: "title", header: "제목" },
  {
    key: "status",
    header: "상태",
    render: (row) => {
      const cfg = AD_STATUS_CONFIG[row.status ?? ""] ?? { label: row.status ?? "-", className: "" };
      return (
        <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>
          {cfg.label}
        </Badge>
      );
    },
  },
  { key: "priority", header: "우선순위", render: (row) => `${row.priority}` },
  { key: "click_url", header: "URL", render: (row) => row.click_url ?? "-" },
];

export function AdsContentsClient() {
  const [registerOpen, setRegisterOpen] = useState(false);

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: { title: "", click_url: "", ad_image: null },
  });

  const handleSubmit = (values: ContentFormValues) => {
    console.log("광고 콘텐츠 저장:", values);
    toast.success("광고 콘텐츠가 등록되었습니다.");
    setRegisterOpen(false);
    form.reset();
  };

  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={MOCK_AD_CONTENTS}
        rowKey={(row) => row.content_id}
        searchPlaceholder="제목 검색"
        toolbarActions={
          <Button size="sm" onClick={() => setRegisterOpen(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            콘텐츠 등록
          </Button>
        }
        showRowActions={false}
      />

      <LayerDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        title="광고 콘텐츠 등록"
        size="md"
        onConfirm={form.handleSubmit(handleSubmit)}
        confirmLabel="등록"
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="ad_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>광고 이미지</FormLabel>
                  <FormControl>
                    <ImageUploader
                      value={field.value}
                      onChange={field.onChange}
                      sizeHint="권장: 1200×400px"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목 *</FormLabel>
                  <FormControl>
                    <Input placeholder="광고 제목" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="click_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>클릭 URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </LayerDialog>
    </div>
  );
}
