import { z } from "zod"

export const objectIdRegex = /^[a-f\d]{24}$/i

export const createCredentialSchema = z.object({
  label: z.string().min(2).max(100).trim(),
  apiKey: z.string().min(1),
  engineId: z.string().min(1),
})

export type CreateCredentialInput = z.infer<typeof createCredentialSchema>

export const credentialIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, "Invalid credential id"),
})

export type CredentialIdParam = z.infer<typeof credentialIdParamSchema>
