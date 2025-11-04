# Service Layer Architecture

This directory contains the service layer implementation following clean architecture and functional programming principles.

## Design Principles

### 1. Functional Programming
- **Pure Functions**: Functions have no side effects and return consistent results for the same inputs
- **Immutability**: Data is not mutated; new objects are created instead
- **Composability**: Small, focused functions that can be combined

### 2. Single Responsibility
- Each service handles one specific domain
- Each function performs one specific task
- Clear separation of concerns

### 3. Decoupled Architecture
- Services are independent and don't depend on each other
- Easy to test, maintain, and extend
- Can be used in different contexts (API routes, background jobs, etc.)

### 4. Type Safety
- Full TypeScript support
- Explicit type definitions
- Compile-time error checking

## Directory Structure

```
services/
├── excel/                    # Core Excel/CSV processing service
│   ├── ExcelService.ts      # Pure functions for parsing and validation
│   ├── types.ts             # Type definitions
│   └── index.ts             # Barrel export
├── dork/                    # Dork module service
│   └── DorkBulkService.ts   # Bulk operations for Dorks
├── category/                # Category module service
│   └── CategoryBulkService.ts
├── location/                # Location module service
│   └── LocationBulkService.ts
└── README.md               # This file
```

## Excel Service

Core service for CSV/Excel file processing.

### Key Functions

#### `parseCsvToJson<T>(buffer, options)`
Parses CSV buffer to JSON array.

```typescript
const data = parseCsvToJson<DorkInput>(buffer, {
  delimiter: ',',
  skipEmptyLines: true,
  trimHeaders: true,
  trimValues: true,
});
```

#### `parseExcelToJson<T>(buffer, sheetName?)`
Parses Excel buffer to JSON array.

```typescript
const data = parseExcelToJson<CategoryInput>(buffer, 'Sheet1');
```

#### `validateHeaders(actual, expected)`
Validates CSV/Excel headers against expected headers.

```typescript
const result = validateHeaders(
  ['name', 'slug'],
  ['name']
);
// { isValid: true, missing: [], extra: ['slug'] }
```

#### `mapDataToSchema<TInput, TOutput>(data, mapping)`
Maps data to target schema using header mapping.

```typescript
const mapped = mapDataToSchema(rawData, {
  'Name': 'name',
  'Category Name': 'name',
});
```

#### `validateBulkData<T>(data, validator)`
Validates bulk data and separates valid/invalid rows.

```typescript
const result = validateBulkData(data, validateDorkData);
// { valid: [...], invalid: [...], totalRows, validCount, invalidCount }
```

## Module Services

Each module has its own service for bulk operations.

### Dork Service

```typescript
import {
  bulkInsertDorks,
  validateDorkData,
  getDorkHeaders,
  getDorkHeaderMapping,
} from '@/lib/services/dork/DorkBulkService';

// Get expected headers
const headers = getDorkHeaders(); // ['query']

// Get header mapping
const mapping = getDorkHeaderMapping();

// Validate data
const validation = validateDorkData({ query: 'site:example.com' });

// Bulk insert
const result = await bulkInsertDorks(validData);
```

### Category Service

```typescript
import {
  bulkInsertCategories,
  validateCategoryData,
  getCategoryHeaders,
  getCategoryHeaderMapping,
} from '@/lib/services/category/CategoryBulkService';

// Auto-generates slug if not provided
const result = await bulkInsertCategories([
  { name: 'Restaurant' }, // slug: 'restaurant'
  { name: 'Cafe', slug: 'coffee-shop' },
]);
```

### Location Service

```typescript
import {
  bulkInsertLocations,
  validateLocationData,
  getLocationHeaders,
  getLocationHeaderMapping,
} from '@/lib/services/location/LocationBulkService';

// Similar to Category service
const result = await bulkInsertLocations(validData);
```

## Usage Example

Complete example of using the service layer:

```typescript
import {
  parseFileToJson,
  validateHeaders,
  mapDataToSchema,
  validateBulkData,
  extractValidData,
} from '@/lib/services/excel';
import {
  bulkInsertDorks,
  validateDorkData,
  getDorkHeaders,
  getDorkHeaderMapping,
} from '@/lib/services/dork/DorkBulkService';

// 1. Parse file
const rawData = parseFileToJson(fileBuffer, filename);

// 2. Validate headers
const headerValidation = validateHeaders(
  Object.keys(rawData[0]),
  getDorkHeaders()
);

if (!headerValidation.isValid) {
  throw new Error('Invalid headers');
}

// 3. Map to schema
const mappedData = mapDataToSchema(
  rawData,
  getDorkHeaderMapping()
);

// 4. Validate data
const validation = validateBulkData(mappedData, validateDorkData);

if (validation.invalidCount > 0) {
  console.log('Invalid rows:', validation.invalid);
}

// 5. Extract valid data
const validData = extractValidData(validation);

// 6. Bulk insert
const result = await bulkInsertDorks(validData);

console.log(`Inserted: ${result.successCount}`);
console.log(`Failed: ${result.failureCount}`);
```

## Adding New Modules

To add bulk import support for a new module:

### 1. Create Module Service

```typescript
// src/lib/services/newmodule/NewModuleBulkService.ts

export type NewModuleBulkInput = {
  field1: string;
  field2: number;
};

export const validateNewModuleData = (data: NewModuleBulkInput) => {
  // Validation logic
};

export const bulkInsertNewModules = async (data: NewModuleBulkInput[]) => {
  // Bulk insert logic
};

export const getNewModuleHeaders = () => ['field1', 'field2'];

export const getNewModuleHeaderMapping = () => ({
  'field1': 'field1',
  'Field 1': 'field1',
  'field2': 'field2',
  'Field 2': 'field2',
});
```

### 2. Update API Route

Add the new module to `src/app/api/bulk-import/[module]/route.ts`:

```typescript
case 'newmodule':
  return {
    headers: getNewModuleHeaders(),
    headerMapping: getNewModuleHeaderMapping(),
    validator: validateNewModuleData,
    bulkInsert: bulkInsertNewModules,
  };
```

### 3. Update Documentation

Add the new module to `docs/bulk-import-guide.md`.

## Testing

Each service function is designed to be easily testable:

```typescript
import { validateDorkData } from '@/lib/services/dork/DorkBulkService';

describe('validateDorkData', () => {
  it('should validate valid dork data', () => {
    const result = validateDorkData({ query: 'site:example.com' });
    expect(result.success).toBe(true);
  });

  it('should reject empty query', () => {
    const result = validateDorkData({ query: '' });
    expect(result.success).toBe(false);
  });
});
```

## Error Handling

All services follow consistent error handling:

1. **Validation Errors**: Return structured error objects
2. **Database Errors**: Caught and returned in result object
3. **Parsing Errors**: Thrown with descriptive messages

```typescript
// Validation error structure
{
  success: false,
  error: {
    issues: [
      { message: 'Query is required' },
      { message: 'Name cannot exceed 50 characters' }
    ]
  }
}

// Bulk insert error structure
{
  success: true,
  failed: [
    {
      data: { query: 'duplicate' },
      error: 'Dork with this query already exists',
      rowNumber: 5
    }
  ]
}
```

## Performance Considerations

1. **Batch Processing**: Each record is processed individually to handle duplicates
2. **Database Connections**: Connection is established once per bulk operation
3. **Memory Usage**: Large files are processed in memory (consider streaming for very large files)
4. **Error Recovery**: Partial failures don't affect successful inserts

## Future Improvements

- [ ] Streaming support for large files
- [ ] Parallel processing with worker threads
- [ ] Transaction support for rollback
- [ ] Caching for duplicate checks
- [ ] Rate limiting for API endpoints
- [ ] Webhook notifications for async processing
