import { type CredentialDTO } from "@/types/credentials"
import { type ApiResponse } from "@/types/auth"

const base = (path: string) => `/api${path}`

export async function getCredentials(): Promise<CredentialDTO[]> {
  const res = await fetch(base(`/credentials`), { credentials: "include" })
  if (!res.ok) throw new Error(`Failed to fetch credentials: ${res.status}`)
  const json = (await res.json()) as ApiResponse<CredentialDTO[]>
  if (!json.success || !json.data) throw new Error(json.error || "Unknown error")
  return json.data
}

export type CreateCredentialPayload = {
  label: string
  apiKey: string
  engineId: string
}

export async function createCredentialApi(payload: CreateCredentialPayload): Promise<CredentialDTO> {
  const res = await fetch(base(`/credentials`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })
  const json = (await res.json()) as ApiResponse<CredentialDTO>
  if (!res.ok || !json.success || !json.data) throw new Error(json.error || "Create failed")
  return json.data
}

export async function deleteCredentialApi(id: string): Promise<void> {
  const res = await fetch(base(`/credentials/${id}`), {
    method: "DELETE",
    credentials: "include",
  })
  if (!res.ok && res.status !== 204) throw new Error(`Delete failed: ${res.status}`)
}
