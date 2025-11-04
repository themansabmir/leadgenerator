import { Credential } from "@/db/models/Credential"

export type CredentialSafe = {
  id: string
  label: string
  createdAt: string
}

export type CredentialRepository = {
  insert: (input: { label: string; apiKeyEncrypted: string; engineIdEncrypted: string }) => Promise<CredentialSafe>
  findSafePaginated: (input: {
    search: string
    sort: Record<string, 1 | -1>
    skip: number
    limit: number
  }) => Promise<CredentialSafe[]>
  countSafe: (input: { search: string }) => Promise<number>
  deleteById: (id: string) => Promise<boolean>
}

function toSafe(doc: any): CredentialSafe {
  return {
    id: doc._id.toString(),
    label: doc.label,
    createdAt: new Date(doc.createdAt).toISOString(),
  }
}

export function createCredentialRepository(): CredentialRepository {
  return {
    async insert(input) {
      const created = await Credential.create({
        label: input.label,
        apiKey: input.apiKeyEncrypted,
        engineId: input.engineIdEncrypted,
      })
      return toSafe(created)
    },

    async findSafePaginated({ search, sort, skip, limit }) {
      const criteria = search
        ? { label: { $regex: search, $options: "i" } }
        : {}
      const docs = await Credential.find(criteria, { label: 1, createdAt: 1 })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true })
      return docs.map(toSafe)
    },

    async countSafe({ search }) {
      const criteria = search
        ? { label: { $regex: search, $options: "i" } }
        : {}
      return Credential.countDocuments(criteria)
    },

    async deleteById(id: string) {
      const res = await Credential.findByIdAndDelete(id)
      return !!res
    },
  }
}
