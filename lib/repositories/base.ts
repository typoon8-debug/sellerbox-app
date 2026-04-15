import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { PaginatedResult, PaginationParams, QueryParams } from "@/lib/types/api";
import { NotFoundError } from "@/lib/errors";

type TableName = keyof Database["public"]["Tables"];
type TableRow<T extends TableName> = Database["public"]["Tables"][T]["Row"];
type TableInsert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];
type TableUpdate<T extends TableName> = Database["public"]["Tables"][T]["Update"];

/**
 * 공통 CRUD 기반 클래스
 * Supabase 제네릭의 복잡한 조건부 타입을 내부에서 unknown으로 처리하고
 * public API는 테이블 Row/Insert/Update 타입으로 노출한다.
 */
export abstract class BaseRepository<T extends TableName> {
  protected readonly client: SupabaseClient<Database>;
  protected readonly table: T;
  protected readonly pk: string;
  protected readonly defaultSort: string;

  constructor(client: SupabaseClient<Database>, table: T, pk: string, defaultSort = "created_at") {
    this.client = client;
    this.table = table;
    this.pk = pk;
    this.defaultSort = defaultSort;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get qb(): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.client as any).from(this.table);
  }

  async findAll(params?: QueryParams): Promise<TableRow<T>[]> {
    let query = this.qb.select("*");

    if (params?.sortBy) {
      query = query.order(params.sortBy, { ascending: params.sortOrder !== "desc" });
    } else {
      query = query.order(this.defaultSort, { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as TableRow<T>[];
  }

  async findById(id: string): Promise<TableRow<T> | null> {
    const { data, error } = await this.qb.select("*").eq(this.pk, id).maybeSingle();

    if (error) throw new Error(error.message);
    return (data ?? null) as TableRow<T> | null;
  }

  async paginate(params: PaginationParams): Promise<PaginatedResult<TableRow<T>>> {
    const { page, pageSize, search, sortBy, sortOrder, filters } = params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    /**
     * ────────────────────────────────────────────────────────────────────
     * 컬럼 최적화 가이드
     * 기본값 "*"는 모든 컬럼을 가져오므로 불필요한 대용량 컬럼이 포함될 수 있음.
     * 도메인별 Repository에서 paginate()를 오버라이드하거나,
     * 아래와 같이 this.qb.select("col1, col2, col3", { count: "exact" }) 형태로
     * 필요 컬럼만 명시하면 네트워크 전송량과 파싱 비용을 줄일 수 있음.
     *
     * 예시 (StoreRepository):
     *   this.qb.select("store_id, name, status, created_at", { count: "exact" })
     *
     * 주의: count: "exact" 옵션은 항상 유지해야 pagination이 정상 동작함.
     * ────────────────────────────────────────────────────────────────────
     */
    let query = this.qb.select("*", { count: "exact" }).range(from, to);

    if (search) {
      query = this.applySearch(query, search);
    }

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
    }

    const sort = sortBy ?? this.defaultSort;
    query = query.order(sort, { ascending: sortOrder !== "desc" });

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    const totalCount = count ?? 0;
    return {
      data: (data ?? []) as TableRow<T>[],
      totalCount,
      hasNextPage: from + pageSize < totalCount,
      page,
      pageSize,
    };
  }

  async create(dto: TableInsert<T>): Promise<TableRow<T>> {
    const { data, error } = await this.qb.insert(dto).select().single();

    if (error) throw new Error(error.message);
    return data as TableRow<T>;
  }

  async update(id: string, dto: TableUpdate<T>): Promise<TableRow<T>> {
    const { data, error } = await this.qb.update(dto).eq(this.pk, id).select().single();

    if (error) throw new Error(error.message);
    if (!data) throw new NotFoundError();
    return data as TableRow<T>;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.qb.delete().eq(this.pk, id);
    if (error) throw new Error(error.message);
  }

  /**
   * 하위 클래스에서 검색 조건을 추가할 때 오버라이드
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  protected applySearch(query: any, _search: string): any {
    return query;
  }
}
