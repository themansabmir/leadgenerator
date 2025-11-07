/**
 * Query Service
 * Pure functions for managing query combos and query links
 * Following functional programming principles with no side effects
 */

import { QueryCombo, QueryLink, Dork } from '@/db/models';
import { IQueryCombo, IQueryLink } from '@/types';
import { logInfo, logError, logDatabaseOperation } from '@/lib/utils/logger';
import { Types } from 'mongoose';

/**
 * Input for creating a query combo
 */
export interface CreateQueryComboInput {
  locationId: string;
  categoryId: string;
  dorkId: string;
  credentialId: string;
  maxAllowedResults?: number;
}

/**
 * Query status information
 */
export interface QueryStatusInfo {
  status: string;
  totalFetched: number;
  progress: number;
  canFetchMore: boolean;
  errorMessage: string | null;
  lastRunAt: Date | null;
  completedAt: Date | null;
}

/**
 * Query progress update input
 */
export interface QueryProgressUpdate {
  insertedCount: number;
  lastStartIndex: number;
  nextStartIndex: number;
}

/**
 * List query combos parameters
 */
export interface ListQueryCombosParams {
  status?: string | string[];
  locationId?: string;
  categoryId?: string;
  dorkId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * List query results parameters
 */
export interface ListQueryResultsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Create or get existing query combo (idempotent)
 * @param input - Query combo creation input
 * @returns Query combo document
 */
export const createOrGetQueryCombo = async (
  input: CreateQueryComboInput
): Promise<IQueryCombo> => {
  try {
    const { locationId, categoryId, dorkId, credentialId, maxAllowedResults = 100 } = input;

    // Fetch dork string from Dork model
    const dork = await Dork.findById(dorkId).lean();
    if (!dork) {
      throw new Error('Dork not found');
    }

    // Try to find existing query combo
    const existing = await QueryCombo.findOne({
      locationId: new Types.ObjectId(locationId),
      categoryId: new Types.ObjectId(categoryId),
      dorkId: new Types.ObjectId(dorkId)
    }).lean();

    if (existing) {
      logInfo('Query combo already exists', { queryComboId: existing._id.toString() });
      return existing as IQueryCombo;
    }

    // Create new query combo
    const queryCombo = await QueryCombo.create({
      locationId: new Types.ObjectId(locationId),
      categoryId: new Types.ObjectId(categoryId),
      dorkId: new Types.ObjectId(dorkId),
      dorkString: dork.query,
      credentialId: new Types.ObjectId(credentialId),
      maxAllowedResults,
      status: 'pending',
      totalResultsFetched: 0,
      lastStartIndex: 0,
      nextStartIndex: 1
    });

    logInfo('Query combo created', { queryComboId: queryCombo._id.toString() });
    logDatabaseOperation('INSERT', 'querycombos', { queryComboId: queryCombo._id.toString() });

    return queryCombo.toObject() as IQueryCombo;
  } catch (error) {
    logError('Failed to create or get query combo', error, input as any);
    throw error;
  }
};

/**
 * Get query combo by ID
 * @param id - Query combo ID
 * @returns Query combo document or null
 */
export const getQueryComboById = async (id: string): Promise<IQueryCombo | null> => {
  try {
    const queryCombo = await QueryCombo.findById(id)
      .populate('locationId', 'name slug')
      .populate('categoryId', 'name slug')
      .populate('dorkId', 'query')
      .populate('credentialId', 'label')
      .lean();

    return queryCombo as IQueryCombo | null;
  } catch (error) {
    logError('Failed to get query combo', error, { id });
    throw error;
  }
};

/**
 * Get query status information
 * @param id - Query combo ID
 * @returns Query status information
 */
export const getQueryStatus = async (id: string): Promise<QueryStatusInfo> => {
  try {
    const queryCombo = await QueryCombo.findById(id).lean();

    if (!queryCombo) {
      throw new Error('Query combo not found');
    }

    const progress = queryCombo.maxAllowedResults > 0
      ? Math.min(100, Math.round((queryCombo.totalResultsFetched / queryCombo.maxAllowedResults) * 100))
      : 0;

    const canFetchMore = queryCombo.totalResultsFetched < queryCombo.maxAllowedResults &&
                         queryCombo.status !== 'completed' &&
                         queryCombo.status !== 'failed';

    return {
      status: queryCombo.status,
      totalFetched: queryCombo.totalResultsFetched,
      progress,
      canFetchMore,
      errorMessage: queryCombo.errorMessage,
      lastRunAt: queryCombo.lastRunAt,
      completedAt: queryCombo.completedAt
    };
  } catch (error) {
    logError('Failed to get query status', error, { id });
    throw error;
  }
};

/**
 * Update query progress after successful page execution
 * @param id - Query combo ID
 * @param update - Progress update data
 */
export const updateQueryProgress = async (
  id: string,
  update: QueryProgressUpdate
): Promise<void> => {
  try {
    const { insertedCount, lastStartIndex, nextStartIndex } = update;

    await QueryCombo.findByIdAndUpdate(id, {
      $inc: { totalResultsFetched: insertedCount },
      $set: {
        lastStartIndex,
        nextStartIndex,
        lastRunAt: new Date(),
        status: 'running'
      }
    });

    logInfo('Query progress updated', { id, insertedCount, nextStartIndex });
    logDatabaseOperation('UPDATE', 'querycombos', { id, insertedCount });
  } catch (error) {
    logError('Failed to update query progress', error, { id, update });
    throw error;
  }
};

/**
 * Mark query as failed
 * @param id - Query combo ID
 * @param errorMessage - Error message
 */
export const markQueryFailed = async (id: string, errorMessage: string): Promise<void> => {
  try {
    await QueryCombo.findByIdAndUpdate(id, {
      $set: {
        status: 'failed',
        errorMessage,
        lastRunAt: new Date()
      }
    });

    logInfo('Query marked as failed', { id, errorMessage });
    logDatabaseOperation('UPDATE', 'querycombos', { id, status: 'failed' });
  } catch (error) {
    logError('Failed to mark query as failed', error, { id });
    throw error;
  }
};

/**
 * Mark query as completed
 * @param id - Query combo ID
 */
export const markQueryCompleted = async (id: string): Promise<void> => {
  try {
    await QueryCombo.findByIdAndUpdate(id, {
      $set: {
        status: 'completed',
        completedAt: new Date(),
        lastRunAt: new Date()
      }
    });

    logInfo('Query marked as completed', { id });
    logDatabaseOperation('UPDATE', 'querycombos', { id, status: 'completed' });
  } catch (error) {
    logError('Failed to mark query as completed', error, { id });
    throw error;
  }
};

/**
 * Pause a running query
 * @param id - Query combo ID
 */
export const pauseQuery = async (id: string): Promise<void> => {
  try {
    const queryCombo = await QueryCombo.findById(id);

    if (!queryCombo) {
      throw new Error('Query combo not found');
    }

    if (queryCombo.status !== 'running' && queryCombo.status !== 'pending') {
      throw new Error('Can only pause running or pending queries');
    }

    await QueryCombo.findByIdAndUpdate(id, {
      $set: { status: 'paused' }
    });

    logInfo('Query paused', { id });
    logDatabaseOperation('UPDATE', 'querycombos', { id, status: 'paused' });
  } catch (error) {
    logError('Failed to pause query', error, { id });
    throw error;
  }
};

/**
 * Resume a paused query
 * @param id - Query combo ID
 */
export const resumeQuery = async (id: string): Promise<void> => {
  try {
    const queryCombo = await QueryCombo.findById(id);

    if (!queryCombo) {
      throw new Error('Query combo not found');
    }

    if (queryCombo.status !== 'paused') {
      throw new Error('Can only resume paused queries');
    }

    await QueryCombo.findByIdAndUpdate(id, {
      $set: { 
        status: 'pending',
        errorMessage: null
      }
    });

    logInfo('Query resumed', { id });
    logDatabaseOperation('UPDATE', 'querycombos', { id, status: 'pending' });
  } catch (error) {
    logError('Failed to resume query', error, { id });
    throw error;
  }
};

/**
 * Reset a query (destructive - clears all results and progress)
 * @param id - Query combo ID
 */
export const resetQuery = async (id: string): Promise<void> => {
  try {
    const queryCombo = await QueryCombo.findById(id);

    if (!queryCombo) {
      throw new Error('Query combo not found');
    }

    // Delete all query links
    const deleteResult = await QueryLink.deleteMany({ queryComboId: new Types.ObjectId(id) });

    // Reset query combo
    await QueryCombo.findByIdAndUpdate(id, {
      $set: {
        status: 'pending',
        totalResultsFetched: 0,
        lastStartIndex: 0,
        nextStartIndex: 1,
        errorMessage: null,
        lastRunAt: null,
        completedAt: null
      }
    });

    logInfo('Query reset', { id, deletedLinks: deleteResult.deletedCount });
    logDatabaseOperation('DELETE', 'querylinks', { queryComboId: id, count: deleteResult.deletedCount });
    logDatabaseOperation('UPDATE', 'querycombos', { id, status: 'reset' });
  } catch (error) {
    logError('Failed to reset query', error, { id });
    throw error;
  }
};

/**
 * List query combos with filtering and pagination
 * @param params - List parameters
 * @returns Query combos and total count
 */
export const listQueryCombos = async (
  params: ListQueryCombosParams
): Promise<{ data: IQueryCombo[]; total: number }> => {
  try {
    const {
      status,
      locationId,
      categoryId,
      dorkId,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    // Build filter criteria
    const filter: any = {};

    if (status) {
      if (Array.isArray(status)) {
        filter.status = { $in: status };
      } else {
        filter.status = status;
      }
    }

    if (locationId) {
      filter.locationId = new Types.ObjectId(locationId);
    }

    if (categoryId) {
      filter.categoryId = new Types.ObjectId(categoryId);
    }

    if (dorkId) {
      filter.dorkId = new Types.ObjectId(dorkId);
    }

    if (search) {
      filter.dorkString = { $regex: search, $options: 'i' };
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      QueryCombo.find(filter)
        .populate('locationId', 'name slug')
        .populate('categoryId', 'name slug')
        .populate('dorkId', 'query')
        .populate('credentialId', 'label')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      QueryCombo.countDocuments(filter)
    ]);

    logDatabaseOperation('FIND', 'querycombos', { count: data.length, total });

    return { data: data as IQueryCombo[], total };
  } catch (error) {
    logError('Failed to list query combos', error, params as any);
    throw error;
  }
};

/**
 * Get query results (links) for a query combo
 * @param queryComboId - Query combo ID
 * @param params - List parameters
 * @returns Query links and total count
 */
export const getQueryResults = async (
  queryComboId: string,
  params: ListQueryResultsParams
): Promise<{ data: IQueryLink[]; total: number }> => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'fetchedAt',
      sortOrder = 'desc'
    } = params;

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      QueryLink.find({ queryComboId: new Types.ObjectId(queryComboId) })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      QueryLink.countDocuments({ queryComboId: new Types.ObjectId(queryComboId) })
    ]);

    logDatabaseOperation('FIND', 'querylinks', { queryComboId, count: data.length, total });

    return { data: data as IQueryLink[], total };
  } catch (error) {
    logError('Failed to get query results', error, { queryComboId, params });
    throw error;
  }
};

/**
 * Insert query links (handles duplicates gracefully)
 * @param queryComboId - Query combo ID
 * @param links - Array of query links to insert
 * @returns Number of successfully inserted links
 */
export const insertQueryLinks = async (
  queryComboId: string,
  links: Omit<IQueryLink, '_id' | 'queryComboId' | 'createdAt' | 'updatedAt'>[]
): Promise<number> => {
  try {
    if (links.length === 0) {
      return 0;
    }

    // Prepare documents for insertion
    const documents = links.map(link => ({
      ...link,
      queryComboId: new Types.ObjectId(queryComboId)
    }));

    // Insert with ordered: false to continue on duplicate key errors
    const result = await QueryLink.insertMany(documents, {
      ordered: false,
      rawResult: true
    }).catch((error: any) => {
      // Handle duplicate key errors gracefully
      if (error.code === 11000) {
        // Return the number of successfully inserted documents
        return { insertedCount: error.result?.nInserted || 0 };
      }
      throw error;
    });

    const insertedCount = result.insertedCount || 0;

    logInfo('Query links inserted', { queryComboId, insertedCount, totalAttempted: links.length });
    logDatabaseOperation('INSERT', 'querylinks', { queryComboId, insertedCount });

    return insertedCount;
  } catch (error) {
    logError('Failed to insert query links', error, { queryComboId, linksCount: links.length });
    throw error;
  }
};

/**
 * Delete query links for a query combo
 * @param queryComboId - Query combo ID
 * @returns Number of deleted links
 */
export const deleteQueryLinks = async (queryComboId: string): Promise<number> => {
  try {
    const result = await QueryLink.deleteMany({ queryComboId: new Types.ObjectId(queryComboId) });

    logInfo('Query links deleted', { queryComboId, deletedCount: result.deletedCount });
    logDatabaseOperation('DELETE', 'querylinks', { queryComboId, deletedCount: result.deletedCount });

    return result.deletedCount || 0;
  } catch (error) {
    logError('Failed to delete query links', error, { queryComboId });
    throw error;
  }
};
