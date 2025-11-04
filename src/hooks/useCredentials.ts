"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createCredentialApi, deleteCredentialApi, getCredentials, type CreateCredentialPayload } from "@/lib/client/credentials.api"
import { queryKeys } from "@/lib/client/queryKeys"

export function useCredentialsQuery() {
  return useQuery({
    queryKey: queryKeys.credentials.all(),
    queryFn: getCredentials,
  })
}

export function useCreateCredentialMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCredentialPayload) => createCredentialApi(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.credentials.all() })
    },
  })
}

export function useDeleteCredentialMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCredentialApi(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.credentials.all() })
    },
  })
}
