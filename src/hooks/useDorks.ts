"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createDorkApi, deleteDorkApi, getDorks, updateDorkApi, type CreateDorkPayload, type DorksListParams, type UpdateDorkPayload } from "@/lib/client/dorks.api"
import { queryKeys } from "@/lib/client/queryKeys"

export function useDorksQuery(params?: DorksListParams) {
  return useQuery({
    queryKey: [...queryKeys.dorks.all(), params],
    queryFn: () => getDorks(params),
    placeholderData: (previousData) => previousData,
  })
}

export function useCreateDorkMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateDorkPayload) => createDorkApi(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.dorks.all() })
    },
  })
}

export function useUpdateDorkMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDorkPayload }) => updateDorkApi(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.dorks.all() })
    },
  })
}

export function useDeleteDorkMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteDorkApi(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.dorks.all() })
    },
  })
}
