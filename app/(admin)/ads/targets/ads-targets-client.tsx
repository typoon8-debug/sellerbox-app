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
import { createAdTarget } from "@/lib/actions/domain/ad.actions";
import type { AdTargetRow } from "@/lib/types/domain/advertisement";
import type { PaginatedResult } from "@/lib/types/api";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

const targetFormSchema = z.object({
  content_id: z.string().min(1, "콘텐츠 ID를 입력하세요"),
  store_id: z.string().min(1, "스토어 ID를 입력하세요"),
  os: z.enum(["IOS", "ANDROID", "WEB"]).optional(),
  app_version_min: z.string().optional(),
  region: z.string().optional(),
});

type TargetFormValues = z.infer<typeof targetFormSchema>;

const columns: DataTableColumn<AdTargetRow>[] = [
  { key: "target_id", header: "타겟 ID", className: "w-28" },
  { key: "content_id", header: "콘텐츠 ID" },
  { key: "os", header: "OS", render: (row) => row.os ?? "전체" },
  { key: "app_version_min", header: "최소 버전", render: (row) => row.app_version_min ?? "-" },
  { key: "region", header: "지역", render: (row) => row.region ?? "전체" },
  {
    key: "status",
    header: "상태",
    render: (row) => (
      <Badge
        variant="outline"
        className={
          row.status === "ACTIVE"
            ? "bg-primary-light text-primary border-primary/30"
            : "bg-disabled text-text-placeholder border-separator"
        }
      >
        {row.status === "ACTIVE" ? "활성" : "비활성"}
      </Badge>
    ),
  },
];

interface AdsTargetsClientProps {
  initialData: PaginatedResult<AdTargetRow>;
}

export function AdsTargetsClient({ initialData }: AdsTargetsClientProps) {
  const router = useRouter();
  const [registerOpen, setRegisterOpen] = useState(false);

  const form = useForm<TargetFormValues>({
    resolver: zodResolver(targetFormSchema),
    defaultValues: {
      content_id: "",
      store_id: "",
      os: "IOS",
      app_version_min: "",
      region: "",
    },
  });

  const handleSubmit = async (values: TargetFormValues) => {
    const result = await createAdTarget({
      content_id: values.content_id,
      store_id: values.store_id,
      os: values.os ?? null,
      app_version_min: values.app_version_min || null,
      region: values.region || null,
      status: "ACTIVE",
    });

    if (result.ok) {
      toast.success("광고 타겟이 등록되었습니다.");
      setRegisterOpen(false);
      form.reset();
      router.refresh();
    } else {
      toast.error(result.error.message ?? "등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={initialData.data}
        rowKey={(row) => row.target_id}
        searchPlaceholder="타겟 ID·콘텐츠 ID 검색"
        toolbarActions={
          <Button size="sm" onClick={() => setRegisterOpen(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            타겟 등록
          </Button>
        }
        showRowActions={false}
      />

      <LayerDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        title="광고 타겟 등록"
        size="md"
        onConfirm={form.handleSubmit(handleSubmit)}
        confirmLabel="등록"
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="content_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>콘텐츠 ID *</FormLabel>
                  <FormControl>
                    <Input placeholder="콘텐츠 UUID" {...field} />
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
              name="os"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OS</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? "IOS"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="IOS">iOS</SelectItem>
                      <SelectItem value="ANDROID">Android</SelectItem>
                      <SelectItem value="WEB">Web</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="app_version_min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>최소 앱 버전</FormLabel>
                  <FormControl>
                    <Input placeholder="3.0.0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>지역</FormLabel>
                  <FormControl>
                    <Input placeholder="서울" {...field} />
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
