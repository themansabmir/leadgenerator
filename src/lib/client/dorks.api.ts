import { type ApiResponse } from "@/types/auth"
import { apiClient } from "@/lib/client/apiClient"
import { type IDork } from "@/types"

export type DorksListParams = {
  page?: number
  limit?: number
  sortField?: string
  sortOrder?: "asc" | "desc"
  search?: string
}

export type PaginatedDorksResponse = {
  data: IDork[]
  total: number
  page: number
  limit: number
}

export async function getDorks(params?: DorksListParams): Promise<PaginatedDorksResponse> {
  const response = await apiClient.get<ApiResponse<PaginatedDorksResponse>>("/dorks", params)
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch dorks")
  }
  return response.data
}

export type CreateDorkPayload = {
  query: string
}

export async function createDorkApi(payload: CreateDorkPayload): Promise<IDork> {
  const response = await apiClient.post<ApiResponse<IDork>>("/dorks", payload)
  if (!response.success || !response.data) {
    throw new Error(response.error || "Create failed")
  }
  return response.data
}

export type UpdateDorkPayload = {
  query: string
}

export async function updateDorkApi(id: string, payload: UpdateDorkPayload): Promise<IDork> {
  const response = await apiClient.put<ApiResponse<IDork>>(`/dorks/${id}`, payload)
  if (!response.success || !response.data) {
    throw new Error(response.error || "Update failed")
  }
  return response.data
}

export async function deleteDorkApi(id: string): Promise<void> {
  await apiClient.delete(`/dorks/${id}`)
}
