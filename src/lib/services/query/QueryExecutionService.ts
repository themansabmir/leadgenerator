/**
 * Query Execution Service
 * Handles execution of query pages with Google Search API
 * Following functional programming principles with comprehensive error handling
 */

import {
  searchGoogleDork,
  normalizeSearchResults,
  hasNextPage,
  calculateNextStartIndex,
  getStartIndexFromResponse
} from '@/lib/services/google/GoogleSearchService';
import {
  getQueryComboById,
  updateQueryProgress,
  markQueryFailed,
  markQueryCompleted,
  insertQueryLinks
} from './QueryService';
import { GoogleSearchError, GoogleSearchErrorCode } from '@/types/google.types';
import { logInfo, logError, logWarn } from '@/lib/utils/logger';
import { QueryCombo } from '@/db/models';

/**
 * Query execution result
 */
export interface QueryExecutionResult {
  success: boolean;
  insertedCount: number;
  hasMore: boolean;
  error?: string;
  errorCode?: GoogleSearchErrorCode;
}

/**
 * Can execute query check result
 */
export interface CanExecuteQueryResult {
  canExecute: boolean;
  reason?: string;
}

/**
 * Check if query can be executed
 * @param queryId - Query combo ID
 * @returns Execution eligibility result
 */
export const canExecuteQuery = async (queryId: string): Promise<CanExecuteQueryResult> => {
  try {
    const queryCombo = await getQueryComboById(queryId);

    if (!queryCombo) {
      return { canExecute: false, reason: 'Query combo not found' };
    }

    // Check status
    if (queryCombo.status === 'completed') {
      return { canExecute: false, reason: 'Query already completed' };
    }

    if (queryCombo.status === 'failed') {
      return { canExecute: false, reason: 'Query failed. Please reset to retry.' };
    }

    if (queryCombo.status === 'paused') {
      return { canExecute: false, reason: 'Query is paused. Please resume first.' };
    }

    // Check if max results reached
    if (queryCombo.totalResultsFetched >= queryCombo.maxAllowedResults) {
      return { canExecute: false, reason: 'Maximum allowed results reached' };
    }

    return { canExecute: true };
  } catch (error) {
    logError('Failed to check if query can execute', error, { queryId });
    return { canExecute: false, reason: 'Error checking query status' };
  }
};

/**
 * Execute a single page of query results
 * @param queryId - Query combo ID
 * @returns Execution result
 */
export const executeQueryPage = async (queryId: string): Promise<QueryExecutionResult> => {
  let retryCount = 0;
  const maxRetries = 3;

  try {
    // Load query combo
    const queryCombo = await getQueryComboById(queryId);

    if (!queryCombo) {
      throw new Error('Query combo not found');
    }

    logInfo('Starting query page execution', {
      queryId,
      nextStartIndex: queryCombo.nextStartIndex,
      totalFetched: queryCombo.totalResultsFetched
    });

    // Validate status
    const canExecute = await canExecuteQuery(queryId);
    if (!canExecute.canExecute) {
      return {
        success: false,
        insertedCount: 0,
        hasMore: false,
        error: canExecute.reason
      };
    }

    // Check limits
    if (queryCombo.nextStartIndex > queryCombo.maxAllowedResults) {
      await markQueryCompleted(queryId);
      return {
        success: true,
        insertedCount: 0,
        hasMore: false
      };
    }

    // Execute with retry logic for network errors
    while (retryCount <= maxRetries) {
      try {
        // Call Google API
        const apiResponse = await searchGoogleDork(
          queryCombo.dorkString,
          queryCombo.credentialId.toString(),
          queryCombo.nextStartIndex
        );

        // Normalize results
        const normalizedResults = normalizeSearchResults(apiResponse, queryId);

        if (normalizedResults.length === 0) {
          // No more results available
          await markQueryCompleted(queryId);
          return {
            success: true,
            insertedCount: 0,
            hasMore: false
          };
        }

        // Map normalized results to query links
        const queryLinks = normalizedResults.map(result => ({
          url: result.url,
          canonicalUrl: result.canonicalUrl,
          title: result.title,
          snippet: result.snippet,
          displayLink: result.displayLink,
          formattedUrl: result.formattedUrl,
          rank: result.rank,
          pageNumber: result.pageNumber,
          fetchedAt: new Date()
        }));

        // Insert links (handles duplicates gracefully)
        const insertedCount = await insertQueryLinks(queryId, queryLinks);

        // Calculate next start index
        const currentStartIndex = getStartIndexFromResponse(apiResponse);
        const nextStartIndex = calculateNextStartIndex(currentStartIndex);

        // Update progress
        await updateQueryProgress(queryId, {
          insertedCount,
          lastStartIndex: currentStartIndex,
          nextStartIndex
        });

        // Check if there are more pages
        const hasMore = hasNextPage(
          apiResponse,
          queryCombo.totalResultsFetched + insertedCount,
          queryCombo.maxAllowedResults
        );

        // Mark as completed if no more pages
        if (!hasMore) {
          await markQueryCompleted(queryId);
        }

        logInfo('Query page execution completed', {
          queryId,
          insertedCount,
          hasMore,
          nextStartIndex
        });

        return {
          success: true,
          insertedCount,
          hasMore
        };

      } catch (error: any) {
        // Handle Google API errors
        if (error.code) {
          const googleError = error as GoogleSearchError;
          return await handleGoogleAPIError(queryId, googleError);
        }

        // Handle network errors with retry
        if (isNetworkError(error)) {
          retryCount++;
          if (retryCount <= maxRetries) {
            logWarn(`Network error, retrying (${retryCount}/${maxRetries})`, {
              queryId,
              error: error.message
            });
            // Wait before retry (exponential backoff)
            await sleep(1000 * Math.pow(2, retryCount - 1));
            continue;
          }
        }

        // Max retries exceeded or other error
        throw error;
      }
    }

    // Should not reach here, but handle anyway
    throw new Error('Max retries exceeded');

  } catch (error: any) {
    logError('Query page execution failed', error, { queryId });

    // Mark query as failed
    const errorMessage = error.message || 'Unknown error occurred';
    await markQueryFailed(queryId, errorMessage);

    return {
      success: false,
      insertedCount: 0,
      hasMore: false,
      error: errorMessage
    };
  }
};

/**
 * Handle Google API specific errors
 * @param queryId - Query combo ID
 * @param error - Google search error
 * @returns Execution result
 */
const handleGoogleAPIError = async (
  queryId: string,
  error: GoogleSearchError
): Promise<QueryExecutionResult> => {
  switch (error.code) {
    case 'RATE_LIMIT':
      // Pause query for rate limit
      await QueryCombo.findByIdAndUpdate(queryId, {
        $set: {
          status: 'paused',
          errorMessage: error.message
        }
      });
      logWarn('Query paused due to rate limit', { queryId });
      return {
        success: false,
        insertedCount: 0,
        hasMore: false,
        error: error.message,
        errorCode: error.code
      };

    case 'QUOTA_EXCEEDED':
      // Mark as failed for quota exceeded
      await markQueryFailed(queryId, error.message);
      logWarn('Query failed due to quota exceeded', { queryId });
      return {
        success: false,
        insertedCount: 0,
        hasMore: false,
        error: error.message,
        errorCode: error.code
      };

    case 'INVALID_CREDENTIAL':
      // Mark as failed for invalid credentials
      await markQueryFailed(queryId, error.message);
      logError('Query failed due to invalid credentials', error, { queryId });
      return {
        success: false,
        insertedCount: 0,
        hasMore: false,
        error: error.message,
        errorCode: error.code
      };

    default:
      // Mark as failed for other errors
      await markQueryFailed(queryId, error.message);
      logError('Query failed due to API error', error, { queryId });
      return {
        success: false,
        insertedCount: 0,
        hasMore: false,
        error: error.message,
        errorCode: error.code
      };
  }
};

/**
 * Check if error is a network error
 * @param error - Error object
 * @returns true if network error
 */
const isNetworkError = (error: any): boolean => {
  const networkErrorMessages = [
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNRESET',
    'network',
    'fetch failed'
  ];

  const errorMessage = error.message?.toLowerCase() || '';
  return networkErrorMessages.some(msg => errorMessage.includes(msg.toLowerCase()));
};

/**
 * Sleep utility for retry delays
 * @param ms - Milliseconds to sleep
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Get queries that are eligible for execution
 * @returns Array of query combos ready for execution
 */
export const getExecutableQueries = async () => {
  try {
    const queries = await QueryCombo.find({
      status: { $in: ['pending', 'running'] },
      $expr: { $lt: ['$totalResultsFetched', '$maxAllowedResults'] }
    })
      .sort({ lastRunAt: 1 }) // Prioritize queries that haven't run recently
      .limit(10)
      .lean();

    return queries;
  } catch (error) {
    logError('Failed to get executable queries', error);
    return [];
  }
};

/**
 * Process query execution (wrapper with lock handling)
 * @param queryId - Query combo ID
 */
export const processQueryExecution = async (queryId: string): Promise<void> => {
  try {
    const result = await executeQueryPage(queryId);

    if (result.success && result.hasMore) {
      logInfo('Query page executed successfully, more pages available', {
        queryId,
        insertedCount: result.insertedCount
      });
    } else if (result.success && !result.hasMore) {
      logInfo('Query execution completed, no more pages', { queryId });
    } else {
      logWarn('Query page execution failed', {
        queryId,
        error: result.error,
        errorCode: result.errorCode
      });
    }
  } catch (error) {
    logError('Process query execution failed', error, { queryId });
    throw error;
  }
};
