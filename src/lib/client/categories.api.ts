import { type ApiResponse } from "@/types/auth"
import { apiClient } from "@/lib/client/apiClient"
import { type ICategory } from "@/types"

export type CategoriesListParams = {
  page?: number
  limit?: number
  sortField?: string
  sortOrder?: "asc" | "desc"
  search?: string
}

export type PaginatedCategoriesResponse = {
  data: ICategory[]
  total: number
  page: number
  limit: number
}

export async function getCategories(params?: CategoriesListParams): Promise<PaginatedCategoriesResponse> {
  const response = await apiClient.get<ApiResponse<PaginatedCategoriesResponse>>("/categories", params)
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch categories")
  }
  return response.data
}

export type CreateCategoryPayload = {
  name: string
  slug?: string
}

export async function createCategoryApi(payload: CreateCategoryPayload): Promise<ICategory> {
  const response = await apiClient.post<ApiResponse<ICategory>>("/categories", payload)
  if (!response.success || !response.data) {
    throw new Error(response.error || "Create failed")
  }
  return response.data
}

export type UpdateCategoryPayload = {
  name: string
  slug?: string
}

export async function updateCategoryApi(id: string, payload: UpdateCategoryPayload): Promise<ICategory> {
  const response = await apiClient.put<ApiResponse<ICategory>>(`/categories/${id}`, payload)
  if (!response.success || !response.data) {
    throw new Error(response.error || "Update failed")
  }
  return response.data
}

export async function deleteCategoryApi(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`)
}
