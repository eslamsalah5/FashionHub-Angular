/**
 * Matches the C# PagedResult<T> shape returned directly in the response body.
 * Fields: items, pageIndex, pageSize, totalCount, totalPages, hasPreviousPage, hasNextPage
 */
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** Convenience factory — creates an empty PaginatedResult with sensible defaults */
export function emptyPage<T>(pageSize = 12): PaginatedResult<T> {
  return { items: [], totalCount: 0, pageIndex: 0, pageSize, totalPages: 0, hasPreviousPage: false, hasNextPage: false };
}
