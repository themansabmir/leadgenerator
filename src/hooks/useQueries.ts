/**
 * Query Hooks
 * React Query hooks for query management
 */

"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createQueryApi,
  getQueries,
  getQueryById,
  executeQueryPage,
  pauseQuery,
  resumeQuery,
  resetQuery,
  getQueryResults,
  getFilterOptions,
  type CreateQueryPayload,
  type QueriesListParams,
  type QueryResultsParams
} from '@/lib/client/queries.api';
import { queryKeys } from '@/lib/client/queryKeys';

/**
 * Query list hook with filtering
 */
export function useQueriesQuery(params?: QueriesListParams) {
  return useQuery({
    queryKey: [...queryKeys.queries.all(), params],
    queryFn: () => getQueries(params),
    placeholderData: (previousData) => previousData,
    refetchInterval: (query) => {
      // Auto-refetch every 3s if there are running queries
      const data = query.state.data;
      if (data?.data?.some((q: any) => q.status === 'running' || q.status === 'pending')) {
        return 3000;
      }
      return false;
    }
  });
}

/**
 * Single query details hook
 */
export function useQueryByIdQuery(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...queryKeys.queries.detail(id)],
    queryFn: () => getQueryById(id),
    enabled,
    refetchInterval: (query) => {
      // Auto-refetch every 3s if query is running
      const data = query.state.data;
      if (data?.status === 'running' || data?.status === 'pending') {
        return 3000;
      }
      return false;
    }
  });
}

/**
 * Query results hook
 */
export function useQueryResultsQuery(id: string, params?: QueryResultsParams, enabled: boolean = true) {
  return useQuery({
    queryKey: [...queryKeys.queries.results(id), params],
    queryFn: () => getQueryResults(id, params),
    enabled,
    placeholderData: (previousData) => previousData
  });
}

/**
 * Filter options hook
 */
export function useFilterOptionsQuery(params?: { locationId?: string; categoryId?: string; dorkId?: string }) {
  return useQuery({
    queryKey: [...queryKeys.queries.filterOptions(), params],
    queryFn: () => getFilterOptions(params),
    placeholderData: (previousData) => previousData
  });
}

/**
 * Create query mutation
 */
export function useCreateQueryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateQueryPayload) => createQueryApi(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.queries.all() });
    }
  });
}

/**
 * Execute query page mutation
 */
export function useExecuteQueryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => executeQueryPage(id),
    onSuccess: async (_, id) => {
      await qc.invalidateQueries({ queryKey: queryKeys.queries.detail(id) });
      await qc.invalidateQueries({ queryKey: queryKeys.queries.all() });
    }
  });
}

/**
 * Pause query mutation
 */
export function usePauseQueryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pauseQuery(id),
    onSuccess: async (_, id) => {
      await qc.invalidateQueries({ queryKey: queryKeys.queries.detail(id) });
      await qc.invalidateQueries({ queryKey: queryKeys.queries.all() });
    }
  });
}

/**
 * Resume query mutation
 */
export function useResumeQueryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resumeQuery(id),
    onSuccess: async (_, id) => {
      await qc.invalidateQueries({ queryKey: queryKeys.queries.detail(id) });
      await qc.invalidateQueries({ queryKey: queryKeys.queries.all() });
    }
  });
}

/**
 * Reset query mutation
 */
export function useResetQueryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resetQuery(id),
    onSuccess: async (_, id) => {
      await qc.invalidateQueries({ queryKey: queryKeys.queries.detail(id) });
      await qc.invalidateQueries({ queryKey: queryKeys.queries.results(id) });
      await qc.invalidateQueries({ queryKey: queryKeys.queries.all() });
    }
  });
}
