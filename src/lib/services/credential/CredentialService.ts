import { type CredentialRepository, type CredentialSafe } from "@/db/repositories/CredentialRepository"
import { type CreateCredentialInput } from "@/lib/validators/credential.validators"

export type CredentialDTO = CredentialSafe

export type CredentialServiceDeps = {
  repo: CredentialRepository
  encrypt: (plaintext: string) => string
}

export const createCredential = async (
  deps: CredentialServiceDeps,
  input: CreateCredentialInput
): Promise<CredentialDTO> => {
  const apiKeyEncrypted = deps.encrypt(input.apiKey)
  const engineIdEncrypted = deps.encrypt(input.engineId)
  return deps.repo.insert({
    label: input.label.trim(),
    apiKeyEncrypted,
    engineIdEncrypted,
  })
}

export type ListCredentialsParams = {
  search: string
  sort: Record<string, 1 | -1>
  skip: number
  limit: number
}

export const listCredentials = async (
  deps: CredentialServiceDeps,
  params: ListCredentialsParams
): Promise<{ data: CredentialDTO[]; total: number }> => {
  const [data, total] = await Promise.all([
    deps.repo.findSafePaginated(params),
    deps.repo.countSafe({ search: params.search }),
  ])

  return { data, total }
}

export const deleteCredential = async (
  deps: CredentialServiceDeps,
  id: string
): Promise<boolean> => {
  return deps.repo.deleteById(id)
}
