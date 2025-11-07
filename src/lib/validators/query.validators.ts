/**
 * Query Validators
 * Zod schemas for validating query-related inputs
 */

import { z } from 'zod';

/**
 * ObjectId regex pattern
 */
export const objectIdRegex = /^[a-f\d]{24}$/i;

/**
 * Query status enum
 */
export const queryStatusEnum = z.enum(['pending', 'running', 'paused', 'completed', 'failed']);

/**
 * Create query combo schema
 */
export const createQuerySchema = z.object({
  locationId: z.string().regex(objectIdRegex, 'Invalid location ID'),
  categoryId: z.string().regex(objectIdRegex, 'Invalid category ID'),
  dorkId: z.string().regex(objectIdRegex, 'Invalid dork ID'),
  credentialId: z.string().regex(objectIdRegex, 'Invalid credential ID'),
  maxAllowedResults: z.number().int().min(1).max(1000).optional().default(100)
});

export type CreateQueryInput = z.infer<typeof createQuerySchema>;

/**
 * Query ID parameter schema
 */
export const queryIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid query ID')
});

export type QueryIdParam = z.infer<typeof queryIdParamSchema>;

/**
 * Query filter schema
 */
export const queryFilterSchema = z.object({
  status: z.union([
    queryStatusEnum,
    z.array(queryStatusEnum)
  ]).optional(),
  locationId: z.string().regex(objectIdRegex, 'Invalid location ID').optional().nullable().transform(val => val ?? undefined),
  categoryId: z.string().regex(objectIdRegex, 'Invalid category ID').optional().nullable().transform(val => val ?? undefined),
  dorkId: z.string().regex(objectIdRegex, 'Invalid dork ID').optional().nullable().transform(val => val ?? undefined),
  search: z.string().optional().nullable().transform(val => val ?? undefined),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'totalResultsFetched', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export type QueryFilterInput = z.infer<typeof queryFilterSchema>;

/**
 * Query results filter schema
 */
export const queryResultsFilterSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  sortBy: z.enum(['fetchedAt', 'rank', 'pageNumber']).optional().default('fetchedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export type QueryResultsFilterInput = z.infer<typeof queryResultsFilterSchema>;

/**
 * Filter options query schema
 */
export const filterOptionsQuerySchema = z.object({
  locationId: z.string().regex(objectIdRegex, 'Invalid location ID').optional().nullable().transform(val => val ?? undefined),
  categoryId: z.string().regex(objectIdRegex, 'Invalid category ID').optional().nullable().transform(val => val ?? undefined),
  dorkId: z.string().regex(objectIdRegex, 'Invalid dork ID').optional().nullable().transform(val => val ?? undefined)
});

export type FilterOptionsQueryInput = z.infer<typeof filterOptionsQuerySchema>;
