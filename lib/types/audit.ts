export interface AuditMeta {
  action: string;
  resource: string;
  payload?: Record<string, unknown>;
}
