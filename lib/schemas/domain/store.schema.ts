import { z } from "zod";

export const createStoreSchema = z.object({
  tenant_id: z.string().uuid("올바른 테넌트 ID를 입력해 주세요."),
  name: z.string().min(1, "가게 이름을 입력해 주세요."),
  store_category: z.string().min(1, "카테고리를 선택해 주세요."),
  address: z.string().min(1, "주소를 입력해 주세요."),
  phone: z.string().min(1, "전화번호를 입력해 주세요."),
  min_delivery_price: z.number().int().min(0),
  delivery_tip: z.number().int().min(0),
  reg_number: z.string().min(1, "사업자 등록번호를 입력해 주세요."),
  jumin_number: z.string().min(1, "주민번호를 입력해 주세요."),
  ceo_name: z.string().min(1, "대표자명을 입력해 주세요."),
  fee: z.number().min(0),
  contract_start_at: z.string().min(1, "계약 시작일을 입력해 주세요."),
  contract_end_at: z.string().min(1, "계약 종료일을 입력해 주세요."),
  status: z.enum(["ACTIVE", "INACTIVE", "CLOSED", "PENDING"]).default("PENDING"),
});

export const updateStoreSchema = z.object({
  store_id: z.string().uuid(),
  name: z.string().min(1).optional(),
  store_category: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  min_delivery_price: z.number().int().min(0).optional(),
  delivery_tip: z.number().int().min(0).optional(),
  fee: z.number().min(0).optional(),
  contract_start_at: z.string().optional(),
  contract_end_at: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "CLOSED", "PENDING"]).optional(),
});

export const deleteStoreSchema = z.object({
  store_id: z.string().uuid(),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type DeleteStoreInput = z.infer<typeof deleteStoreSchema>;
