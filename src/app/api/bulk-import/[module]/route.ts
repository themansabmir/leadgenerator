/**
 * Bulk Import API Route
 * Unified endpoint for bulk importing data from CSV/Excel files
 * Supports multiple modules via dynamic parameter
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  logRequestStart,
  logRequestComplete,
  logError,
  logWarn,
  logInfo,
  createRequestContext,
} from '@/lib/utils/logger';
import {
  parseFileToJson,
  validateHeaders,
  mapDataToSchema,
  validateBulkData,
  extractValidData,
} from '@/lib/services/excel/ExcelService';
import {
  bulkInsertDorks,
  validateDorkData,
  getDorkHeaders,
  getDorkHeaderMapping,
  type DorkBulkInput,
} from '@/lib/services/dork/DorkBulkService';
import {
  bulkInsertCategories,
  validateCategoryData,
  getCategoryHeaders,
  getCategoryHeaderMapping,
  type CategoryBulkInput,
} from '@/lib/services/category/CategoryBulkService';
import {
  bulkInsertLocations,
  validateLocationData,
  getLocationHeaders,
  getLocationHeaderMapping,
  type LocationBulkInput,
} from '@/lib/services/location/LocationBulkService';

/**
 * Supported module types
 */
type ModuleName = 'dorks' | 'categories' | 'locations';

/**
 * Module configuration
 */
type ModuleConfig<T> = {
  headers: string[];
  headerMapping: Record<string, string>;
  validator: (data: T) => { success: boolean; data?: T; error?: { issues: Array<{ message: string }> } };
  bulkInsert: (data: T[]) => Promise<{
    success: boolean;
    inserted: T[];
    failed: Array<{ data: T; error: string; rowNumber: number }>;
    totalProcessed: number;
    successCount: number;
    failureCount: number;
  }>;
};

/**
 * Get module configuration based on module name
 */
const getModuleConfig = (moduleName: string): ModuleConfig<unknown> | null => {
  switch (moduleName.toLowerCase()) {
    case 'dorks':
      return {
        headers: getDorkHeaders(),
        headerMapping: getDorkHeaderMapping(),
        validator: validateDorkData as (data: unknown) => { success: boolean; data?: unknown; error?: { issues: Array<{ message: string }> } },
        bulkInsert: bulkInsertDorks as (data: unknown[]) => Promise<{
          success: boolean;
          inserted: unknown[];
          failed: Array<{ data: unknown; error: string; rowNumber: number }>;
          totalProcessed: number;
          successCount: number;
          failureCount: number;
        }>,
      };

    case 'categories':
      return {
        headers: getCategoryHeaders(),
        headerMapping: getCategoryHeaderMapping(),
        validator: validateCategoryData as (data: unknown) => { success: boolean; data?: unknown; error?: { issues: Array<{ message: string }> } },
        bulkInsert: bulkInsertCategories as (data: unknown[]) => Promise<{
          success: boolean;
          inserted: unknown[];
          failed: Array<{ data: unknown; error: string; rowNumber: number }>;
          totalProcessed: number;
          successCount: number;
          failureCount: number;
        }>,
      };

    case 'locations':
      return {
        headers: getLocationHeaders(),
        headerMapping: getLocationHeaderMapping(),
        validator: validateLocationData as (data: unknown) => { success: boolean; data?: unknown; error?: { issues: Array<{ message: string }> } },
        bulkInsert: bulkInsertLocations as (data: unknown[]) => Promise<{
          success: boolean;
          inserted: unknown[];
          failed: Array<{ data: unknown; error: string; rowNumber: number }>;
          totalProcessed: number;
          successCount: number;
          failureCount: number;
        }>,
      };

    default:
      return null;
  }
};

/**
 * POST /api/bulk-import/[module]
 * Upload and process CSV/Excel file for bulk import
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ module: string }> }
) {
  const startTime = Date.now();
  let moduleName = 'unknown';
  
  try {
    const { module } = await context.params;
    moduleName = module;
    
    const requestContext = createRequestContext('POST', `/api/bulk-import/${module}`, {
      module,
    });
    logRequestStart('POST', `/api/bulk-import/${module}`, requestContext);

    // Validate module name
    const moduleConfig = getModuleConfig(module);
    if (!moduleConfig) {
      logWarn(`Invalid module name provided: ${module}`, requestContext);
      return NextResponse.json(
        {
          success: false,
          error: `Invalid module name: ${module}. Supported modules: dorks, categories, locations`,
        },
        { status: 400 }
      );
    }
    
    logInfo(`Module config loaded for: ${module}`, requestContext);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      logWarn('No file provided in request', requestContext);
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided. Please upload a CSV or Excel file.',
        },
        { status: 400 }
      );
    }
    
    logInfo(`File received: ${file.name} (${file.size} bytes, ${file.type})`, {
      ...requestContext,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      logWarn(`Invalid file type: ${file.type}`, {
        ...requestContext,
        fileName: file.name,
        fileType: file.type,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Please upload a CSV or Excel file.',
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse file to JSON
    let parsedData: Record<string, unknown>[];
    try {
      parsedData = parseFileToJson(buffer, file.name);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'File parsing failed';
      logError('File parsing failed', error, {
        ...requestContext,
        fileName: file.name,
        fileSize: file.size,
      });
      return NextResponse.json(
        {
          success: false,
          error: `Failed to parse file: ${errorMessage}`,
        },
        { status: 400 }
      );
    }
    
    logInfo(`File parsed successfully: ${parsedData.length} rows`, {
      ...requestContext,
      rowCount: parsedData.length,
    });

    if (parsedData.length === 0) {
      logWarn('Parsed file contains no data', requestContext);
      return NextResponse.json(
        {
          success: false,
          error: 'File is empty or contains no valid data.',
        },
        { status: 400 }
      );
    }

    // Validate headers
    const actualHeaders = Object.keys(parsedData[0]);
    const headerValidation = validateHeaders(actualHeaders, moduleConfig.headers);

    if (!headerValidation.isValid) {
      logWarn('Header validation failed', {
        ...requestContext,
        expected: moduleConfig.headers,
        actual: actualHeaders,
        missing: headerValidation.missing,
        extra: headerValidation.extra,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file headers',
          details: {
            missing: headerValidation.missing,
            extra: headerValidation.extra,
            expected: moduleConfig.headers,
            actual: actualHeaders,
          },
        },
        { status: 400 }
      );
    }
    
    logInfo('Headers validated successfully', requestContext);

    // Map data to schema
    const mappedData = mapDataToSchema(parsedData, moduleConfig.headerMapping);
    logInfo(`Data mapped to schema: ${mappedData.length} rows`, {
      ...requestContext,
      mappedRowCount: mappedData.length,
    });

    // Validate data
    const validationResult = validateBulkData(mappedData, moduleConfig.validator);
    logInfo(`Data validation complete: ${validationResult.validCount} valid, ${validationResult.invalidCount} invalid`, {
      ...requestContext,
      validCount: validationResult.validCount,
      invalidCount: validationResult.invalidCount,
    });

    if (validationResult.invalidCount > 0) {
      logWarn('Data validation failed - all rows invalid', {
        ...requestContext,
        invalidCount: validationResult.invalidCount,
        totalRows: validationResult.totalRows,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Data validation failed',
          validation: {
            totalRows: validationResult.totalRows,
            validCount: validationResult.validCount,
            invalidCount: validationResult.invalidCount,
            invalidRows: validationResult.invalid.map((row) => ({
              rowNumber: row.rowNumber,
              errors: row.errors,
            })),
          },
        },
        { status: 400 }
      );
    }

    // Extract valid data
    const validData = extractValidData(validationResult);

    // Bulk insert
    logInfo(`Starting bulk insert: ${validData.length} rows`, {
      ...requestContext,
      rowCount: validData.length,
    });
    const insertResult = await moduleConfig.bulkInsert(validData);
    logInfo(`Bulk insert completed: ${insertResult.successCount} success, ${insertResult.failureCount} failed`, {
      ...requestContext,
      successCount: insertResult.successCount,
      failureCount: insertResult.failureCount,
    });

    // Return result
    const duration = Date.now() - startTime;
    logRequestComplete('POST', `/api/bulk-import/${module}`, insertResult.success ? 200 : 207, duration, {
      ...requestContext,
      successCount: insertResult.successCount,
      failureCount: insertResult.failureCount,
    });
    
    return NextResponse.json(
      {
        success: insertResult.success,
        message: `Bulk import completed for ${module}`,
        result: {
          totalProcessed: insertResult.totalProcessed,
          successCount: insertResult.successCount,
          failureCount: insertResult.failureCount,
          inserted: insertResult.inserted,
          failed: insertResult.failed,
        },
      },
      { status: insertResult.success ? 200 : 207 } // 207 Multi-Status if partial success
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(`Bulk import failed for module: ${moduleName}`, error, {
      method: 'POST',
      endpoint: `/api/bulk-import/${moduleName}`,
      module: moduleName,
      duration,
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      {
        success: false,
        error: 'Bulk import failed',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
