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
import { MOCK_AD_CAPS } from "@/lib/mocks/ad";
import type { AdCapRow } from "@/lib/types/domain/advertisement";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

const capFormSchema = z.object({
  max_impressions_total: z.number().min(0),
  max_impressions_per_user_day: z.number().min(0),
  max_clicks_total: z.number().min(0),
});

type CapFormValues = z.infer<typeof capFormSchema>;

const columns: DataTableColumn<AdCapRow>[] = [
  { key: "cap_id", header: "한도 ID", className: "w-28" },
  { key: "content_id", header: "콘텐츠 ID" },
  {
    key: "max_impressions_total",
    header: "총 노출 한도",
    render: (row) => row.max_impressions_total?.toLocaleString() ?? "-",
  },
  {
    key: "max_impressions_per_user_day",
    header: "일 노출 한도",
    render: (row) => row.max_impressions_per_user_day?.toLocaleString() ?? "-",
  },
  {
    key: "max_clicks_total",
    header: "총 클릭 한도",
    render: (row) => row.max_clicks_total?.toLocaleString() ?? "-",
  },
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

export function AdsCapsClient() {
  const [registerOpen, setRegisterOpen] = useState(false);

  const form = useForm<CapFormValues>({
    resolver: zodResolver(capFormSchema),
    defaultValues: {
      max_impressions_total: 0,
      max_impressions_per_user_day: 0,
      max_clicks_total: 0,
    },
  });

  const handleSubmit = (values: CapFormValues) => {
    console.log("광고 한도 저장:", values);
    toast.success("광고 한도가 등록되었습니다.");
    setRegisterOpen(false);
    form.reset();
  };

  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={MOCK_AD_CAPS}
        rowKey={(row) => row.cap_id}
        searchPlaceholder="한도 ID·콘텐츠 ID 검색"
        toolbarActions={
          <Button size="sm" onClick={() => setRegisterOpen(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            한도 등록
          </Button>
        }
        showRowActions={false}
      />

      <LayerDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        title="광고 한도 등록"
        size="md"
        onConfirm={form.handleSubmit(handleSubmit)}
        confirmLabel="등록"
      >
        <Form {...form}>
          <form className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="max_impressions_total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>총 노출 한도</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="100000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                  <FormLabel>사용자당 일 노출 한도</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                  <FormLabel>총 클릭 한도</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="5000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
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
