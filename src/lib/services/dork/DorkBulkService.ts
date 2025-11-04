/**
 * Dork Bulk Service
 * Service layer for bulk insert operations on Dork module
 * Follows functional programming and single responsibility principles
 */

import { Dork } from '@/db/models';
import { connectDB } from '@/db/mongodb';
import type { BulkInsertResult } from '../excel/types';

/**
 * Dork input type for bulk insert
 */
export type DorkBulkInput = {
  query: string;
};

/**
 * Validate single dork data
 * Pure function that validates dork structure
 */
export const validateDorkData = (
  data: DorkBulkInput
): { success: boolean; data?: DorkBulkInput; error?: { issues: Array<{ message: string }> } } => {
  const errors: Array<{ message: string }> = [];

  // Validate query field
  if (!data.query || typeof data.query !== 'string') {
    errors.push({ message: 'Query is required and must be a string' });
  } else if (data.query.trim().length === 0) {
    errors.push({ message: 'Query cannot be empty' });
  } else if (data.query.trim().length > 255) {
    errors.push({ message: 'Query cannot exceed 255 characters' });
  }

  if (errors.length > 0) {
    return { success: false, error: { issues: errors } };
  }

  return {
    success: true,
    data: {
      query: data.query.trim(),
    },
  };
};

/**
 * Bulk insert dorks into database
 * Handles duplicates gracefully and returns detailed results
 */
export const bulkInsertDorks = async (
  data: DorkBulkInput[]
): Promise<BulkInsertResult<DorkBulkInput>> => {
  await connectDB();

  const inserted: DorkBulkInput[] = [];
  const failed: Array<{
    data: DorkBulkInput;
    error: string;
    rowNumber: number;
  }> = [];

  // Process each dork individually to handle duplicates
  for (let i = 0; i < data.length; i++) {
    const dorkData = data[i];
    try {
      // Check if dork already exists
      const existing = await Dork.findOne({ query: dorkData.query });
      
      if (existing) {
        failed.push({
          data: dorkData,
          error: 'Dork with this query already exists',
          rowNumber: i + 1,
        });
        continue;
      }

      // Insert new dork
      await Dork.create(dorkData);
      inserted.push(dorkData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      failed.push({
        data: dorkData,
        error: errorMessage,
        rowNumber: i + 1,
      });
    }
  }

  return {
    success: inserted.length > 0,
    inserted,
    failed,
    totalProcessed: data.length,
    successCount: inserted.length,
    failureCount: failed.length,
  };
};

/**
 * Get expected CSV headers for Dork module
 */
export const getDorkHeaders = (): string[] => {
  return ['query'];
};

/**
 * Get header mapping for Dork module
 * Maps CSV headers to database field names
 */
export const getDorkHeaderMapping = (): Record<string, string> => {
  return {
    query: 'query',
    Query: 'query',
    QUERY: 'query',
    'Dork Query': 'query',
    'dork query': 'query',
  };
};
