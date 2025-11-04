/**
 * Excel Service Types
 * Type definitions for Excel/CSV parsing and bulk import operations
 */

/**
 * Validation result for a single row
 */
export type RowValidationResult<T> = {
  isValid: boolean;
  data?: T;
  errors?: string[];
  rowNumber: number;
};

/**
 * Bulk validation result
 */
export type BulkValidationResult<T> = {
  valid: RowValidationResult<T>[];
  invalid: RowValidationResult<T>[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
};

/**
 * Bulk insert result
 */
export type BulkInsertResult<T> = {
  success: boolean;
  inserted: T[];
  failed: Array<{
    data: T;
    error: string;
    rowNumber: number;
  }>;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
};

/**
 * CSV parse options
 */
export type CsvParseOptions = {
  delimiter?: string;
  skipEmptyLines?: boolean;
  trimHeaders?: boolean;
  trimValues?: boolean;
};

/**
 * Header mapping configuration
 */
export type HeaderMapping = Record<string, string>;

/**
 * Module-specific bulk insert handler
 */
export type BulkInsertHandler<T> = (data: T[]) => Promise<BulkInsertResult<T>>;
