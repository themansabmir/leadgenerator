import { NextResponse } from "next/server"

export type PaginationParams = {
  page: number
  limit: number
  skip: number
}

export type SortParams = Record<string, 1 | -1>

export function getPaginationParams(params: URLSearchParams): PaginationParams {
  const page = Math.max(Number(params.get("page") ?? 1), 1)
  const limit = Math.min(Math.max(Number(params.get("limit") ?? 10), 1), 100)
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

export function getSortParams(
  params: URLSearchParams,
  options: { defaultField: string; defaultOrder?: "asc" | "desc"; allowedFields?: string[] }
): SortParams {
  const sortFieldFromParams = params.get("sortField") ?? options.defaultField
  const allowed = options.allowedFields ?? [options.defaultField]
  const sortField = allowed.includes(sortFieldFromParams) ? sortFieldFromParams : options.defaultField
  const sortOrderParam = params.get("sortOrder") ?? options.defaultOrder ?? "asc"
  const sortOrder: 1 | -1 = sortOrderParam === "desc" ? -1 : 1

  return { [sortField]: sortOrder }
}

export function getSearchParam(params: URLSearchParams, key = "search"): string {
  return params.get(key)?.trim() ?? ""
}

export function buildPaginatedResponse<T>(
  data: T[],
  meta: { total: number; page: number; limit: number }
) {
  return NextResponse.json({
    success: true,
    data: {
      data,
      total: meta.total,
      page: meta.page,
      limit: meta.limit,
    },
  })
}
