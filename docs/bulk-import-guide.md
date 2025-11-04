# Bulk Import Guide

This guide explains how to use the bulk import feature to upload multiple records at once using CSV or Excel files.

## Supported Modules

- **Dorks** - Google search dorks
- **Categories** - Business categories
- **Locations** - Geographic locations

## API Endpoint

```
POST /api/bulk-import/[module]
```

Replace `[module]` with one of: `dorks`, `categories`, or `locations`

## File Format Requirements

### Supported File Types
- CSV (`.csv`)
- Excel (`.xlsx`, `.xls`)

### General Rules
- First row must contain headers
- Headers are case-insensitive
- Empty rows are automatically skipped
- Whitespace is automatically trimmed

## Module-Specific Formats

### Dorks

**Required Headers:**
- `query` (or `Query`, `QUERY`, `Dork Query`)

**Example CSV:**
```csv
query
site:example.com inurl:contact
intitle:"index of" site:example.com
filetype:pdf site:example.com
```

**Validation Rules:**
- Query is required
- Query cannot be empty
- Query cannot exceed 255 characters
- Duplicate queries will be rejected

---

### Categories

**Required Headers:**
- `name` (or `Name`, `NAME`, `Category Name`)

**Optional Headers:**
- `slug` (or `Slug`, `SLUG`) - Auto-generated from name if not provided

**Example CSV:**
```csv
name,slug
Restaurant,restaurant
Cafe,cafe
Hotel,hotel
```

Or without slug (auto-generated):
```csv
name
Restaurant
Cafe
Hotel
```

**Validation Rules:**
- Name is required
- Name cannot be empty
- Name cannot exceed 50 characters
- Slug can only contain lowercase letters, numbers, and hyphens
- Duplicate names or slugs will be rejected

---

### Locations

**Required Headers:**
- `name` (or `Name`, `NAME`, `Location Name`)

**Optional Headers:**
- `slug` (or `Slug`, `SLUG`) - Auto-generated from name if not provided

**Example CSV:**
```csv
name,slug
New York,new-york
Los Angeles,los-angeles
Chicago,chicago
```

Or without slug (auto-generated):
```csv
name
New York
Los Angeles
Chicago
```

**Validation Rules:**
- Name is required
- Name cannot be empty
- Name cannot exceed 100 characters
- Slug can only contain lowercase letters, numbers, and hyphens
- Duplicate names or slugs will be rejected

---

## Using the API

### Request Format

```bash
curl -X POST \
  http://localhost:3000/api/bulk-import/dorks \
  -F "file=@dorks.csv"
```

### Success Response (200)

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

### Partial Success Response (207)

```json
{
  "success": true,
  "message": "Bulk import completed for dorks",
  "result": {
    "totalProcessed": 10,
    "successCount": 8,
    "failureCount": 2,
    "inserted": [...],
    "failed": [
      {
        "data": { "query": "duplicate query" },
        "error": "Dork with this query already exists",
        "rowNumber": 5
      }
    ]
  }
}
```

### Validation Error Response (400)

```json
{
  "success": false,
  "error": "Data validation failed",
  "validation": {
    "totalRows": 10,
    "validCount": 8,
    "invalidCount": 2,
    "invalidRows": [
      {
        "rowNumber": 3,
        "errors": ["Query cannot be empty"]
      },
      {
        "rowNumber": 7,
        "errors": ["Query cannot exceed 255 characters"]
      }
    ]
  }
}
```

### Header Validation Error (400)

```json
{
  "success": false,
  "error": "Invalid file headers",
  "details": {
    "missing": ["query"],
    "extra": ["invalid_column"],
    "expected": ["query"],
    "actual": ["invalid_column"]
  }
}
```

---

## Best Practices

1. **Test with small files first** - Start with 5-10 records to verify format
2. **Check for duplicates** - Remove duplicate entries before upload
3. **Use consistent casing** - While headers are case-insensitive, consistent casing improves readability
4. **Validate data locally** - Check for empty values and length constraints
5. **Handle partial failures** - Review the `failed` array in the response for any errors
6. **Use slugs wisely** - Let the system auto-generate slugs unless you need specific values

---

## Error Handling

The API handles errors gracefully:

- **File parsing errors** - Invalid CSV/Excel format
- **Header validation errors** - Missing or incorrect headers
- **Data validation errors** - Invalid field values
- **Duplicate errors** - Records that already exist
- **Database errors** - Connection or constraint issues

All errors include detailed messages to help you fix the issue.

---

## Architecture

The bulk import system follows clean architecture principles:

### Service Layers

1. **Excel Service** (`src/lib/services/excel/`)
   - CSV/Excel parsing
   - Header validation
   - Data mapping and transformation

2. **Module Services** (`src/lib/services/{module}/`)
   - Module-specific validation
   - Bulk insert logic
   - Duplicate handling

3. **API Route** (`src/app/api/bulk-import/[module]/`)
   - Request handling
   - Module routing
   - Response formatting

### Key Features

- **Functional Programming** - Pure functions, no side effects
- **Single Responsibility** - Each function has one purpose
- **Decoupled Design** - Services are independent and reusable
- **Type Safety** - Full TypeScript support
- **Error Handling** - Comprehensive error messages

---

## Sample Files

Create sample CSV files for testing:

### dorks-sample.csv
```csv
query
site:example.com inurl:contact
intitle:"index of" site:example.com
filetype:pdf site:example.com
```

### categories-sample.csv
```csv
name
Restaurant
Cafe
Hotel
Gym
Spa
```

### locations-sample.csv
```csv
name
New York
Los Angeles
Chicago
Houston
Phoenix
```

---

## Troubleshooting

### Issue: "Invalid file headers"
**Solution:** Ensure your CSV has the correct header names (see module-specific formats above)

### Issue: "Data validation failed"
**Solution:** Check the `invalidRows` array in the response for specific validation errors

### Issue: "Duplicate entries"
**Solution:** Remove duplicate records from your file or delete existing records first

### Issue: "File parsing failed"
**Solution:** Ensure your file is a valid CSV or Excel file with proper formatting

---

## Future Enhancements

Potential improvements for future versions:

- [ ] Support for update operations (not just insert)
- [ ] Batch size configuration
- [ ] Progress tracking for large files
- [ ] Async processing with job queue
- [ ] Download template files from UI
- [ ] Preview before import
- [ ] Rollback on partial failures
