/**
 * Bulk Import Client
 * Client-side API methods for bulk import operations
 */

export type ModuleName = 'dorks' | 'categories' | 'locations';

export type BulkImportResponse = {
  success: boolean;
  message: string;
  result: {
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    inserted: unknown[];
    failed: Array<{
      data: unknown;
      error: string;
      rowNumber: number;
    }>;
  };
};

export type BulkImportErrorResponse = {
  success: false;
  error: string;
  details?: unknown;
  validation?: {
    totalRows: number;
    validCount: number;
    invalidCount: number;
    invalidRows: Array<{
      rowNumber: number;
      errors: string[];
    }>;
  };
};

/**
 * Upload file for bulk import
 */
export const uploadBulkImport = async (
  moduleName: ModuleName,
  file: File
): Promise<BulkImportResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/bulk-import/${moduleName}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return data;
};

/**
 * Get module display name
 */
export const getModuleDisplayName = (moduleName: ModuleName): string => {
  const names: Record<ModuleName, string> = {
    dorks: 'Dorks',
    categories: 'Categories',
    locations: 'Locations',
  };
  return names[moduleName];
};

/**
 * Get accepted file types
 */
export const getAcceptedFileTypes = (): string => {
  return '.csv,.xlsx,.xls';
};

/**
 * Validate file before upload
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const validTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  
  const validExtensions = ['.csv', '.xlsx', '.xls'];
  const hasValidExtension = validExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );

  if (!validTypes.includes(file.type) && !hasValidExtension) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a CSV or Excel file.',
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit.',
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty.',
    };
  }

  return { valid: true };
};
