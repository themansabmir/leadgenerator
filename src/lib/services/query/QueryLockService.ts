/**
 * Query Lock Service
 * In-memory locking mechanism to prevent concurrent query executions
 * Following functional programming principles
 */

import { logInfo, logWarn } from '@/lib/utils/logger';

/**
 * In-memory map to track query execution locks
 */
const executionLocks = new Map<string, boolean>();

/**
 * Acquire lock for query execution
 * @param queryId - Query combo ID
 * @returns true if lock acquired, false if already locked
 */
export const acquireLock = (queryId: string): boolean => {
  if (executionLocks.get(queryId)) {
    logWarn('Query execution lock already held', { queryId });
    return false;
  }

  executionLocks.set(queryId, true);
  logInfo('Query execution lock acquired', { queryId });
  return true;
};

/**
 * Release lock for query execution
 * @param queryId - Query combo ID
 */
export const releaseLock = (queryId: string): void => {
  executionLocks.delete(queryId);
  logInfo('Query execution lock released', { queryId });
};

/**
 * Check if query is currently locked
 * @param queryId - Query combo ID
 * @returns true if locked, false otherwise
 */
export const isLocked = (queryId: string): boolean => {
  return executionLocks.get(queryId) || false;
};

/**
 * Clear all locks (useful for testing or recovery)
 */
export const clearAllLocks = (): void => {
  const count = executionLocks.size;
  executionLocks.clear();
  logInfo('All query execution locks cleared', { count });
};

/**
 * Get count of active locks
 * @returns Number of active locks
 */
export const getActiveLockCount = (): number => {
  return executionLocks.size;
};
