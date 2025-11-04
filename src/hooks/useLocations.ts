"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createLocationApi, deleteLocationApi, getLocations, updateLocationApi, type CreateLocationPayload, type LocationsListParams, type UpdateLocationPayload } from "@/lib/client/locations.api"
import { queryKeys } from "@/lib/client/queryKeys"

export function useLocationsQuery(params?: LocationsListParams) {
  return useQuery({
    queryKey: [...queryKeys.locations.all(), params],
    queryFn: () => getLocations(params),
    placeholderData: (previousData) => previousData,
  })
}

export function useCreateLocationMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateLocationPayload) => createLocationApi(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.locations.all() })
    },
  })
}

export function useUpdateLocationMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLocationPayload }) => updateLocationApi(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.locations.all() })
    },
  })
}

export function useDeleteLocationMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteLocationApi(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.locations.all() })
    },
  })
}
