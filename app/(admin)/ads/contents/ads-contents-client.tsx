"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { LayerDialog } from "@/components/admin/layer-dialog";
import { ImageUploader } from "@/components/admin/image-uploader";
import { createAdContent } from "@/lib/actions/domain/ad.actions";
import { uploadImageAction } from "@/lib/actions/storage.actions";
import type { AdContentRow } from "@/lib/types/domain/advertisement";
import type { PaginatedResult } from "@/lib/types/api";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

const AD_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "초안", className: "bg-disabled text-text-placeholder border-separator" },
  READY: { label: "준비", className: "bg-blue-50 text-blue-700 border-blue-200" },
  ACTIVE: { label: "활성", className: "bg-primary-light text-primary border-primary/30" },
  PAUSED: { label: "일시정지", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  ENDED: { label: "종료", className: "bg-alert-red-bg text-alert-red border-alert-red/30" },
};

// 광고 이미지 타입 — 선택한 타입에 따라 리사이징 크기 결정
const AD_IMAGE_TYPES = {
  type1: { width: 375, height: 160, label: "타입1 (375×160px)" },
  type2: { width: 345, height: 70, label: "타입2 (345×70px)" },
} as const;

type AdImageType = keyof typeof AD_IMAGE_TYPES;

// UI용 폼 스키마 (placement_id, store_id는 UUID 필수)
const contentFormSchema = z.object({
  placement_id: z.string().min(1, "게재 위치 ID를 입력하세요"),
  store_id: z.string().min(1, "스토어 ID를 입력하세요"),
  title: z.string().min(1, "제목을 입력하세요"),
  click_url: z.string().optional(),
  ad_image: z.string().nullable(),
  status: z.enum(["DRAFT", "READY", "ACTIVE", "PAUSED", "ENDED"]),
  priority: z.number().int().min(0),
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

interface AdsContentsClientProps {
  initialData: PaginatedResult<AdContentRow>;
}

export function AdsContentsClient({ initialData }: AdsContentsClientProps) {
  const router = useRouter();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  // 선택한 광고 이미지 타입 (리사이징 크기 결정)
  const [adImageType, setAdImageType] = useState<AdImageType>("type1");

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      placement_id: "",
      store_id: "",
      title: "",
      click_url: "",
      ad_image: null,
      status: "DRAFT",
      priority: 0,
    },
  });

  const handleSubmit = async (values: ContentFormValues) => {
    let imageUrl: string | null = values.ad_image;

    // 이미지 파일이 있으면 Storage에 업로드 (서버 액션 사용)
    if (imageFile) {
      const fd = new FormData();
      fd.append("file", imageFile);
      const result = await uploadImageAction("ad-images", fd);
      if (!result.ok) {
        toast.error("이미지 업로드에 실패했습니다.");
        return;
      }
      imageUrl = result.url;
    }

    const result = await createAdContent({
      placement_id: values.placement_id,
      store_id: values.store_id,
      title: values.title,
      click_url: values.click_url || null,
      ad_image: imageUrl,
      priority: values.priority,
      status: values.status,
    });

    if (result.ok) {
      toast.success("광고 콘텐츠가 등록되었습니다.");
      setRegisterOpen(false);
      setImageFile(null);
      form.reset();
      router.refresh();
    } else {
      toast.error(result.error.message ?? "등록 중 오류가 발생했습니다.");
    }
  };

  const currentImageSize = AD_IMAGE_TYPES[adImageType];

  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={initialData.data}
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
            {/* 이미지 타입 선택 */}
            <FormItem>
              <FormLabel>이미지 타입</FormLabel>
              <Select
                value={adImageType}
                onValueChange={(v) => {
                  setAdImageType(v as AdImageType);
                  // 타입 변경 시 기존 이미지 초기화
                  form.setValue("ad_image", null);
                  setImageFile(null);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(
                    Object.entries(AD_IMAGE_TYPES) as [
                      AdImageType,
                      (typeof AD_IMAGE_TYPES)[AdImageType],
                    ][]
                  ).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

            <FormField
              control={form.control}
              name="ad_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>광고 이미지</FormLabel>
                  <FormControl>
                    <ImageUploader
                      value={field.value}
                      onChange={(url) => {
                        field.onChange(url);
                      }}
                      onFileSelect={(file) => setImageFile(file)}
                      expectedWidth={currentImageSize.width}
                      expectedHeight={currentImageSize.height}
                      autoResize
                      sizeHint={currentImageSize.label}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="placement_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>게재 위치 ID *</FormLabel>
                  <FormControl>
                    <Input placeholder="게재 위치 ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="store_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>스토어 ID *</FormLabel>
                  <FormControl>
                    <Input placeholder="스토어 UUID" {...field} />
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
            <div className="grid grid-cols-2 gap-3">
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
                        <SelectItem value="DRAFT">초안</SelectItem>
                        <SelectItem value="READY">준비</SelectItem>
                        <SelectItem value="ACTIVE">활성</SelectItem>
                        <SelectItem value="PAUSED">일시정지</SelectItem>
                        <SelectItem value="ENDED">종료</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>우선순위</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </LayerDialog>
    </div>
  );
}
