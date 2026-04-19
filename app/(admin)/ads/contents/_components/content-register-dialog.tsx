"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import { LayerDialog } from "@/components/admin/layer-dialog";
import { ImageUploader } from "@/components/admin/image-uploader";
import { createAdContent, updateAdContent } from "@/lib/actions/domain/ad.actions";
import type { AdContentRow } from "@/lib/types/domain/advertisement";

// 광고 이미지 타입별 리사이징 크기
const AD_IMAGE_TYPES = {
  type1: { width: 375, height: 160, label: "타입1 (375×160px)" },
  type2: { width: 345, height: 70, label: "타입2 (345×70px)" },
} as const;

type AdImageType = keyof typeof AD_IMAGE_TYPES;

const AD_PLACEMENTS = [
  { value: "HERO", label: "HERO (히어로 배너)" },
  { value: "MID_1", label: "MID_1 (중단 1)" },
  { value: "MID_2", label: "MID_2 (중단 2)" },
  { value: "FOOTER", label: "FOOTER (하단)" },
] as const;

const formSchema = z.object({
  placement_id: z.enum(["HERO", "MID_1", "MID_2", "FOOTER"]),
  title: z.string().min(1, "제목을 입력하세요"),
  click_url: z.string().optional().nullable(),
  ad_image: z.string().nullable(),
  ad_image_type: z.enum(["type1", "type2"]),
  status: z.enum(["DRAFT", "READY", "ACTIVE", "PAUSED", "ENDED"]),
  priority: z.number().int().min(0),
});

type FormValues = z.infer<typeof formSchema>;

interface ContentRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  editTarget?: AdContentRow | null;
  onSuccess: (row: AdContentRow) => void;
}

export function ContentRegisterDialog({
  open,
  onOpenChange,
  storeId,
  editTarget,
  onSuccess,
}: ContentRegisterDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      placement_id: "HERO",
      title: "",
      click_url: "",
      ad_image: null,
      ad_image_type: "type1",
      status: "DRAFT",
      priority: 0,
    },
  });

  const adImageType = form.watch("ad_image_type");
  const currentImageSize = AD_IMAGE_TYPES[adImageType];

  // 수정 시 기존 값으로 폼 초기화
  useEffect(() => {
    if (editTarget) {
      form.reset({
        placement_id: (editTarget.placement_id as FormValues["placement_id"]) ?? "HERO",
        title: editTarget.title,
        click_url: editTarget.click_url ?? "",
        ad_image: editTarget.ad_image ?? null,
        ad_image_type: "type1",
        status: editTarget.status as FormValues["status"],
        priority: editTarget.priority,
      });
    } else {
      form.reset({
        placement_id: "HERO",
        title: "",
        click_url: "",
        ad_image: null,
        ad_image_type: "type1",
        status: "DRAFT",
        priority: 0,
      });
    }
  }, [editTarget, open, form]);

  const handleSubmit = async (values: FormValues) => {
    const payload = {
      placement_id: values.placement_id,
      store_id: storeId,
      title: values.title,
      click_url: values.click_url || null,
      ad_image: values.ad_image,
      priority: values.priority,
      status: values.status,
    };

    if (editTarget) {
      const result = await updateAdContent({ content_id: editTarget.content_id, ...payload });
      if (!result.ok) {
        toast.error(result.error.message ?? "수정 중 오류가 발생했습니다.");
        return;
      }
      toast.success("광고 콘텐츠가 수정되었습니다.");
      onSuccess(result.data as AdContentRow);
    } else {
      const result = await createAdContent(payload);
      if (!result.ok) {
        toast.error(result.error.message ?? "등록 중 오류가 발생했습니다.");
        return;
      }
      toast.success("광고 콘텐츠가 등록되었습니다.");
      onSuccess(result.data as AdContentRow);
    }
    onOpenChange(false);
  };

  return (
    <LayerDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editTarget ? "광고 콘텐츠 수정" : "광고 콘텐츠 등록"}
      size="md"
      onConfirm={form.handleSubmit(handleSubmit)}
      confirmLabel={editTarget ? "수정" : "등록"}
    >
      <Form {...form}>
        <form className="space-y-4 p-4">
          {/* 이미지 타입 선택 */}
          <FormField
            control={form.control}
            name="ad_image_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이미지 타입</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    form.setValue("ad_image", null);
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
            )}
          />

          {/* 광고 이미지 */}
          <FormField
            control={form.control}
            name="ad_image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>광고 이미지</FormLabel>
                <FormControl>
                  <ImageUploader
                    value={field.value}
                    onChange={(url) => field.onChange(url)}
                    expectedWidth={currentImageSize.width}
                    expectedHeight={currentImageSize.height}
                    autoResize
                    sizeHint={currentImageSize.label}
                    bucket="ads"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 광고 위치 */}
          <FormField
            control={form.control}
            name="placement_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>광고 위치 *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="광고 위치 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AD_PLACEMENTS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 제목 */}
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

          {/* 클릭 URL */}
          <FormField
            control={form.control}
            name="click_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>클릭 URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            {/* 상태 */}
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

            {/* 우선순위 */}
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
  );
}
