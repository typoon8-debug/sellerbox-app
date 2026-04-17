"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer, Save, X } from "lucide-react";
import type { CsTicketWithJoins } from "@/lib/types/domain/support";

const actionFormSchema = z.object({
  cs_action: z.string().min(1, "CS 처리결과를 입력해 주세요."),
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]),
});

type ActionFormValues = z.infer<typeof actionFormSchema>;

interface CsActionPanelProps {
  ticket: CsTicketWithJoins | null;
  onClose: () => void;
  onSave: (values: ActionFormValues) => void;
  onPrint: () => void;
  loading?: boolean;
}

export function CsActionPanel({
  ticket,
  onClose,
  onSave,
  onPrint,
  loading = false,
}: CsActionPanelProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ActionFormValues>({
    resolver: zodResolver(actionFormSchema),
    defaultValues: { cs_action: "", status: "OPEN" },
  });

  // 선택된 티켓이 바뀌면 폼 초기화
  useEffect(() => {
    if (ticket) {
      reset({
        cs_action: ticket.cs_action ?? "",
        status: ticket.status as "OPEN" | "IN_PROGRESS" | "CLOSED",
      });
    } else {
      reset({ cs_action: "", status: "OPEN" });
    }
  }, [ticket, reset]);

  const statusValue = watch("status");

  if (!ticket) {
    return (
      <div className="flex h-full min-h-32 items-center justify-center rounded-md border border-dashed text-sm text-gray-400">
        CS 티켓을 선택하면 처리 입력 영역이 표시됩니다.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-3 rounded-md border p-4">
      <p className="text-sm font-semibold text-gray-700">CS처리결과</p>

      <div className="flex flex-col gap-1">
        <Label htmlFor="cs_action" className="text-xs text-gray-500">
          CS처리 결과 <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="cs_action"
          {...register("cs_action")}
          rows={6}
          placeholder="고객에게 전달할 처리 결과를 입력해 주세요."
          className="resize-none text-sm"
        />
        {errors.cs_action && <p className="text-xs text-red-500">{errors.cs_action.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs text-gray-500">
          상태 <span className="text-red-500">*</span>
        </Label>
        <Select
          value={statusValue}
          onValueChange={(val) =>
            setValue("status", val as "OPEN" | "IN_PROGRESS" | "CLOSED", {
              shouldDirty: true,
            })
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OPEN">OPEN</SelectItem>
            <SelectItem value="IN_PROGRESS">처리중</SelectItem>
            <SelectItem value="CLOSED">완료</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-auto flex justify-between gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPrint}
          disabled={loading}
          className="gap-1"
        >
          <Printer className="h-4 w-4" />
          CS 출력
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (isDirty) {
                onClose();
              } else {
                onClose();
              }
            }}
            disabled={loading}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            닫기
          </Button>
          <Button type="submit" size="sm" disabled={loading} className="gap-1">
            <Save className="h-4 w-4" />
            저장
          </Button>
        </div>
      </div>
    </form>
  );
}

export type { ActionFormValues };
