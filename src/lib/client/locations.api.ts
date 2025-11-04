import { type ApiResponse } from "@/types/auth"
import { apiClient } from "@/lib/client/apiClient"
import { type ILocation } from "@/types"

export type LocationsListParams = {
  page?: number
  limit?: number
  sortField?: string
  sortOrder?: "asc" | "desc"
  search?: string
}

export type PaginatedLocationsResponse = {
  data: ILocation[]
  total: number
  page: number
  limit: number
}

export async function getLocations(params?: LocationsListParams): Promise<PaginatedLocationsResponse> {
  const response = await apiClient.get<ApiResponse<PaginatedLocationsResponse>>("/locations", params)
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch locations")
  }
  return response.data
}

export type CreateLocationPayload = {
  name: string
  slug?: string
}

export async function createLocationApi(payload: CreateLocationPayload): Promise<ILocation> {
  const response = await apiClient.post<ApiResponse<ILocation>>("/locations", payload)
  if (!response.success || !response.data) {
    throw new Error(response.error || "Create failed")
  }
  return response.data
}

export type UpdateLocationPayload = {
  name: string
  slug?: string
}

export async function updateLocationApi(id: string, payload: UpdateLocationPayload): Promise<ILocation> {
  const response = await apiClient.put<ApiResponse<ILocation>>(`/locations/${id}`, payload)
  if (!response.success || !response.data) {
    throw new Error(response.error || "Update failed")
  }
  return response.data
}

export async function deleteLocationApi(id: string): Promise<void> {
  await apiClient.delete(`/locations/${id}`)
}
