import { type CredentialDTO } from "@/types/credentials"
import { type ApiResponse } from "@/types/auth"
import { apiClient } from "@/lib/client/apiClient"

export type CredentialsListParams = {
  page?: number
  limit?: number
  sortField?: string
  sortOrder?: "asc" | "desc"
  search?: string
}

export type PaginatedCredentialsResponse = {
  data: CredentialDTO[]
  total: number
  page: number
  limit: number
}

export async function getCredentials(params?: CredentialsListParams): Promise<PaginatedCredentialsResponse> {
  const response = await apiClient.get<ApiResponse<PaginatedCredentialsResponse>>("/credentials", params)
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch credentials")
  }
  return response.data
}

export type CreateCredentialPayload = {
  label: string
  apiKey: string
  engineId: string
}

export async function createCredentialApi(payload: CreateCredentialPayload): Promise<CredentialDTO> {
  const response = await apiClient.post<ApiResponse<CredentialDTO>>("/credentials", payload)
  if (!response.success || !response.data) {
    throw new Error(response.error || "Create failed")
  }
  return response.data
}

export async function deleteCredentialApi(id: string): Promise<void> {
  await apiClient.delete(`/credentials/${id}`)
}
