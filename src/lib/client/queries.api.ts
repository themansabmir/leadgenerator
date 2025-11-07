/**
 * Query API Client
 * Client-side API functions for query management
 */

import { apiClient } from '@/lib/client/apiClient';
import { type ApiResponse } from '@/types/auth';

/**
 * Query combo data types
 */
export type QueryComboDTO = {
  _id: string;
  locationId: any;
  categoryId: any;
  dorkId: any;
  dorkString: string;
  credentialId: any;
  totalResultsFetched: number;
  lastStartIndex: number;
  nextStartIndex: number;
  maxAllowedResults: number;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  errorMessage: string | null;
  lastRunAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  progress?: number;
  canFetchMore?: boolean;
};

export type QueryLinkDTO = {
  _id: string;
  queryComboId: string;
  url: string;
  canonicalUrl: string;
  title: string;
  snippet: string;
  displayLink: string | null;
  formattedUrl: string | null;
  rank: number | null;
  pageNumber: number | null;
  fetchedAt: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * API request/response types
 */
export type CreateQueryPayload = {
  locationId: string;
  categoryId: string;
  dorkId: string;
  credentialId: string;
  maxAllowedResults?: number;
};

export type QueriesListParams = {
  status?: string | string[];
  locationId?: string;
  categoryId?: string;
  dorkId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type PaginatedQueriesResponse = {
  data: QueryComboDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

export type QueryResultsParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type PaginatedQueryResultsResponse = {
  data: QueryLinkDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

export type FilterOption = {
  id: string;
  name?: string;
  slug?: string;
  query?: string;
  count: number;
};

export type FilterOptionsResponse = {
  locations: FilterOption[];
  categories: FilterOption[];
  dorks: FilterOption[];
};

/**
 * Create and run a new query
 */
export async function createQueryApi(payload: CreateQueryPayload): Promise<{ queryId: string; status: string; message: string }> {
  const response = await apiClient.post<ApiResponse<{ queryId: string; status: string; message: string }>>('/queries/run', payload);
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to create query');
  }
  return response.data;
}

/**
 * Get list of queries with filtering
 */
export async function getQueries(params?: QueriesListParams): Promise<PaginatedQueriesResponse> {
  // Convert status array to comma-separated string for API
  const apiParams: any = params ? { ...params } : {};
  if (apiParams.status && Array.isArray(apiParams.status)) {
    apiParams.status = apiParams.status.join(',');
  }
  
  const response = await apiClient.get<any>('/queries', apiParams);
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch queries');
  }
  
  // API returns { success, data: [...], pagination: {...} }
  // We need to restructure it to { data: [...], pagination: {...} }
  return {
    data: response.data,
    pagination: response.pagination
  };
}

/**
 * Get query details by ID
 */
export async function getQueryById(id: string): Promise<QueryComboDTO> {
  const response = await apiClient.get<ApiResponse<QueryComboDTO>>(`/queries/${id}`);
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch query');
  }
  return response.data;
}

/**
 * Execute a single page of query results
 */
export async function executeQueryPage(id: string): Promise<any> {
  const response = await apiClient.post<ApiResponse<any>>(`/queries/${id}/execute`, {});
  if (!response.success) {
    throw new Error(response.error || 'Failed to execute query');
  }
  return response.data;
}

/**
 * Pause a query
 */
export async function pauseQuery(id: string): Promise<void> {
  const response = await apiClient.post<ApiResponse<any>>(`/queries/${id}/pause`, {});
  if (!response.success) {
    throw new Error(response.error || 'Failed to pause query');
  }
}

/**
 * Resume a query
 */
export async function resumeQuery(id: string): Promise<void> {
  const response = await apiClient.post<ApiResponse<any>>(`/queries/${id}/resume`, {});
  if (!response.success) {
    throw new Error(response.error || 'Failed to resume query');
  }
}

/**
 * Reset a query
 */
export async function resetQuery(id: string): Promise<void> {
  const response = await apiClient.post<ApiResponse<any>>(`/queries/${id}/reset`, {});
  if (!response.success) {
    throw new Error(response.error || 'Failed to reset query');
  }
}

/**
 * Get query results
 */
export async function getQueryResults(id: string, params?: QueryResultsParams): Promise<PaginatedQueryResultsResponse> {
  const response = await apiClient.get<ApiResponse<PaginatedQueryResultsResponse>>(`/queries/${id}/results`, params);
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch query results');
  }
  return response.data;
}

/**
 * Get filter options
 */
export async function getFilterOptions(params?: { locationId?: string; categoryId?: string; dorkId?: string }): Promise<FilterOptionsResponse> {
  const response = await apiClient.get<ApiResponse<FilterOptionsResponse>>('/filter-options', params);
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch filter options');
  }
  return response.data;
}

/**
 * Export query results as CSV
 */
export function getExportUrl(id: string): string {
  return `/api/queries/${id}/export`;
}
