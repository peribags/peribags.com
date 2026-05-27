import "server-only";

export type Pagination = { page: number; pageSize: number };
export type Page<T> = {
  rows: T[];
  page: number;
  pageSize: number;
  total: number;
};

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

export function parsePagination(searchParams: URLSearchParams): Pagination {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const requested =
    Number(searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE) ||
    DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, requested));
  return { page, pageSize };
}

export function rangeFor({ page, pageSize }: Pagination): {
  from: number;
  to: number;
} {
  const from = (page - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
}
