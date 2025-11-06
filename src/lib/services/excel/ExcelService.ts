/**
 * Excel Service
 * Core service for CSV/Excel parsing, validation, and data transformation
 * Follows functional programming principles with pure functions
 */

import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type {
  CsvParseOptions,
  HeaderMapping,
  RowValidationResult,
  BulkValidationResult,
} from './types';

/**
 * Parse CSV file buffer to JSON array
 * Pure function that transforms CSV buffer to array of objects
 */
export const parseCsvToJson = <T = Record<string, unknown>>(
  fileBuffer: Buffer,
  options: CsvParseOptions = {}
): T[] => {
  const {
    delimiter = ',',
    skipEmptyLines = true,
    trimHeaders = true,
    trimValues = true,
  } = options;

  const csvString = fileBuffer.toString('utf-8');

  const parseResult = Papa.parse<T>(csvString, {
    header: true,
    delimiter,
    skipEmptyLines,
    transformHeader: trimHeaders ? (header: string) => header.trim() : undefined,
    transform: trimValues ? (value: string) => value.trim() : undefined,
  });

  if (parseResult.errors.length > 0) {
    const errorMessages = parseResult.errors
      .map((err: Papa.ParseError) => `Row ${err.row}: ${err.message}`)
      .join('; ');
    throw new Error(`CSV parsing failed: ${errorMessages}`);
  }

  return parseResult.data;
};

/**
 * Parse Excel file buffer to JSON array
 * Supports .xlsx, .xls formats
 */
export const parseExcelToJson = <T = Record<string, unknown>>(
  fileBuffer: Buffer,
  sheetName?: string
): T[] => {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

  const targetSheet = sheetName || workbook.SheetNames[0];
  
  if (!workbook.Sheets[targetSheet]) {
    throw new Error(`Sheet "${targetSheet}" not found in workbook`);
  }

  const worksheet = workbook.Sheets[targetSheet];
  const jsonData = XLSX.utils.sheet_to_json<T>(worksheet, {
    raw: false,
    defval: '',
  });

  return jsonData;
};

/**
 * Validate CSV/Excel headers against expected headers
 * Pure function that checks if all required headers are present
 * Note: This now allows extra headers (for optional fields)
 */
export const validateHeaders = (
  actualHeaders: string[],
  expectedHeaders: string[],
  requiredHeaders?: string[]
): { isValid: boolean; missing: string[]; extra: string[] } => {
  const actualSet = new Set(actualHeaders.map((h) => h.toLowerCase().trim()));
  const expectedSet = new Set(expectedHeaders.map((h) => h.toLowerCase().trim()));
  
  // If requiredHeaders is provided, only check those; otherwise check all expected headers
  const headersToCheck = requiredHeaders || expectedHeaders;
  const requiredSet = new Set(headersToCheck.map((h) => h.toLowerCase().trim()));

  const missing = headersToCheck.filter(
    (header) => !actualSet.has(header.toLowerCase().trim())
  );

  const extra = actualHeaders.filter(
    (header) => !expectedSet.has(header.toLowerCase().trim())
  );

  return {
    isValid: missing.length === 0,
    missing,
    extra,
  };
};

/**
 * Map CSV/Excel data to target schema using header mapping
 * Pure function that transforms object keys based on mapping
 */
export const mapDataToSchema = <TInput, TOutput>(
  data: TInput[],
  headerMapping: HeaderMapping
): TOutput[] => {
  return data.map((row) => {
    const mappedRow: Record<string, unknown> = {};
    const sourceRow = row as Record<string, unknown>;

    // Create a case-insensitive lookup for header mapping
    const mappingLookup = new Map<string, string>();
    Object.entries(headerMapping).forEach(([sourceKey, targetKey]) => {
      mappingLookup.set(sourceKey.toLowerCase().trim(), targetKey);
    });

    // Map each field from source row
    Object.entries(sourceRow).forEach(([sourceKey, value]) => {
      const normalizedKey = sourceKey.toLowerCase().trim();
      
      // Check if there's a mapping for this key
      if (mappingLookup.has(normalizedKey)) {
        const targetKey = mappingLookup.get(normalizedKey)!;
        mappedRow[targetKey] = value;
      } else {
        // If no mapping exists, use the original key (for optional fields)
        mappedRow[sourceKey] = value;
      }
    });

    return mappedRow as TOutput;
  });
};

/**
 * Validate individual row using custom validator function
 * Returns validation result with errors if any
 */
export const validateRow = <T>(
  row: T,
  rowNumber: number,
  validator: (data: T) => { success: boolean; data?: T; error?: { issues: Array<{ message: string }> } }
): RowValidationResult<T> => {
  const result = validator(row);

  if (result.success && result.data) {
    return {
      isValid: true,
      data: result.data,
      rowNumber,
    };
  }

  const errors = result.error?.issues.map((issue) => issue.message) || ['Validation failed'];

  return {
    isValid: false,
    errors,
    rowNumber,
  };
};

/**
 * Validate bulk data using custom validator
 * Separates valid and invalid rows
 */
export const validateBulkData = <T>(
  data: T[],
  validator: (data: T) => { success: boolean; data?: T; error?: { issues: Array<{ message: string }> } }
): BulkValidationResult<T> => {
  const validationResults = data.map((row, index) =>
    validateRow(row, index + 1, validator)
  );

  const valid = validationResults.filter((result) => result.isValid);
  const invalid = validationResults.filter((result) => !result.isValid);

  return {
    valid,
    invalid,
    totalRows: data.length,
    validCount: valid.length,
    invalidCount: invalid.length,
  };
};

/**
 * Extract valid data from validation result
 * Pure function that filters and maps to data only
 */
export const extractValidData = <T>(
  validationResult: BulkValidationResult<T>
): T[] => {
  return validationResult.valid
    .filter((result) => result.data !== undefined)
    .map((result) => result.data as T);
};

/**
 * Detect file type from buffer
 */
export const detectFileType = (
  fileBuffer: Buffer,
  filename?: string
): 'csv' | 'excel' | 'unknown' => {
  if (filename) {
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'csv') return 'csv';
    if (ext === 'xlsx' || ext === 'xls') return 'excel';
  }

  // Check magic numbers for Excel files
  const header = fileBuffer.slice(0, 4).toString('hex');
  if (header === '504b0304' || header === 'd0cf11e0') {
    return 'excel';
  }

  // Assume CSV if not Excel
  return 'csv';
};

/**
 * Parse file buffer to JSON based on file type
 * Unified function that handles both CSV and Excel
 */
export const parseFileToJson = <T = Record<string, unknown>>(
  fileBuffer: Buffer,
  filename?: string,
  options?: CsvParseOptions
): T[] => {
  const fileType = detectFileType(fileBuffer, filename);

  if (fileType === 'excel') {
    return parseExcelToJson<T>(fileBuffer);
  }

  return parseCsvToJson<T>(fileBuffer, options);
};
