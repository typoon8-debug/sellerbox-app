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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { LayerDialog } from "@/components/admin/layer-dialog";
import { MOCK_AD_TARGETS } from "@/lib/mocks/ad";
import type { AdTargetRow } from "@/lib/types/domain/advertisement";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

const targetFormSchema = z.object({
  os: z.enum(["IOS", "ANDROID", "WEB"]),
  app_version_min: z.string().optional(),
  region: z.string().optional(),
});

type TargetFormValues = z.infer<typeof targetFormSchema>;

const columns: DataTableColumn<AdTargetRow>[] = [
  { key: "target_id", header: "타겟 ID", className: "w-28" },
  { key: "content_id", header: "콘텐츠 ID" },
  { key: "os", header: "OS" },
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

export function AdsTargetsClient() {
  const [registerOpen, setRegisterOpen] = useState(false);

  const form = useForm<TargetFormValues>({
    resolver: zodResolver(targetFormSchema),
    defaultValues: { os: "IOS", app_version_min: "", region: "" },
  });

  const handleSubmit = (values: TargetFormValues) => {
    console.log("광고 타겟 저장:", values);
    toast.success("광고 타겟이 등록되었습니다.");
    setRegisterOpen(false);
    form.reset();
  };

  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={MOCK_AD_TARGETS}
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
              name="os"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OS *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
