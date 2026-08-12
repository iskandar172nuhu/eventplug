import { Prisma } from "@prisma/client"

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginationResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function getPaginationArgs(params: PaginationParams) {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20))
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
    page,
    pageSize,
  }
}

export function buildPaginationResult<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginationResult<T> {
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export type SortDirection = "asc" | "desc"

export function buildOrderBy(
  sortBy: string | undefined,
  allowedFields: Record<string, Prisma.SortOrder | object>
): Prisma.SortOrder | object | undefined {
  if (!sortBy) return undefined
  return allowedFields[sortBy] ?? undefined
}
