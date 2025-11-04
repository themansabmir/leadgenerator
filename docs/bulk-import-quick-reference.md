# Bulk Import Quick Reference

## API Endpoints

```
POST /api/bulk-import/dorks
POST /api/bulk-import/categories
POST /api/bulk-import/locations
```

## Quick Test with cURL

### Dorks
```bash
curl -X POST http://localhost:3000/api/bulk-import/dorks \
  -F "file=@public/samples/dorks-sample.csv"
```

### Categories
```bash
curl -X POST http://localhost:3000/api/bulk-import/categories \
  -F "file=@public/samples/categories-sample.csv"
```

### Locations
```bash
curl -X POST http://localhost:3000/api/bulk-import/locations \
  -F "file=@public/samples/locations-sample.csv"
```

## CSV Format

### Dorks
```csv
query
site:example.com inurl:contact
```

### Categories
```csv
name
Restaurant
```

### Locations
```csv
name
New York
```

## Service Layer Files

```
src/lib/services/
├── excel/
│   ├── ExcelService.ts       # Core parsing & validation
│   ├── types.ts               # Type definitions
│   └── index.ts               # Exports
├── dork/
│   └── DorkBulkService.ts     # Dork bulk operations
├── category/
│   └── CategoryBulkService.ts # Category bulk operations
└── location/
    └── LocationBulkService.ts # Location bulk operations
```

## API Route

```
src/app/api/bulk-import/[module]/route.ts
```

## Sample Files

```
public/samples/
├── dorks-sample.csv
├── categories-sample.csv
└── locations-sample.csv
```

## Key Functions

### Excel Service
- `parseFileToJson()` - Parse CSV/Excel to JSON
- `validateHeaders()` - Validate headers
- `mapDataToSchema()` - Map data to schema
- `validateBulkData()` - Validate bulk data
- `extractValidData()` - Extract valid rows

### Module Services
- `bulkInsert{Module}()` - Bulk insert records
- `validate{Module}Data()` - Validate single record
- `get{Module}Headers()` - Get expected headers
- `get{Module}HeaderMapping()` - Get header mapping

## Response Format

### Success
```json
{
  "success": true,
  "message": "Bulk import completed for dorks",
  "result": {
    "totalProcessed": 10,
    "successCount": 10,
    "failureCount": 0,
    "inserted": [...],
    "failed": []
  }
}
```

### Partial Success
```json
{
  "success": true,
  "result": {
    "successCount": 8,
    "failureCount": 2,
    "failed": [
      {
        "data": {...},
        "error": "Duplicate entry",
        "rowNumber": 5
      }
    ]
  }
}
```

## Architecture Principles

✅ **Functional Programming** - Pure functions, no side effects  
✅ **Single Responsibility** - Each function has one purpose  
✅ **Decoupled Design** - Independent, reusable services  
✅ **Type Safety** - Full TypeScript support  
✅ **Clean Code** - Clear, maintainable, well-documented  

## Adding New Module

1. Create service in `src/lib/services/{module}/`
2. Implement validation and bulk insert functions
3. Add module case to API route
4. Create sample CSV file
5. Update documentation

## Testing

```bash
# Start dev server
npm run dev

# Test with sample files
curl -X POST http://localhost:3000/api/bulk-import/dorks \
  -F "file=@public/samples/dorks-sample.csv"
```
