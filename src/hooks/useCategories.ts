"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createCategoryApi, deleteCategoryApi, getCategories, updateCategoryApi, type CategoriesListParams, type CreateCategoryPayload, type UpdateCategoryPayload } from "@/lib/client/categories.api"
import { queryKeys } from "@/lib/client/queryKeys"

export function useCategoriesQuery(params?: CategoriesListParams) {
  return useQuery({
    queryKey: [...queryKeys.categories.all(), params],
    queryFn: () => getCategories(params),
    placeholderData: (previousData) => previousData,
  })
}

export function useCreateCategoryMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategoryApi(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.categories.all() })
    },
  })
}

export function useUpdateCategoryMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) => updateCategoryApi(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.categories.all() })
    },
  })
}

export function useDeleteCategoryMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCategoryApi(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.categories.all() })
    },
  })
}
