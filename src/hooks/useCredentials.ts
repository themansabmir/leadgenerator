"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createCredentialApi, deleteCredentialApi, getCredentials, type CreateCredentialPayload, type CredentialsListParams } from "@/lib/client/credentials.api"
import { queryKeys } from "@/lib/client/queryKeys"

export function useCredentialsQuery(params?: CredentialsListParams) {
  return useQuery({
    queryKey: [...queryKeys.credentials.all(), params],
    queryFn: () => getCredentials(params),
    placeholderData: (previousData) => previousData,
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
