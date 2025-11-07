# Task 04: Query Module - SERP Scraper

**Phase:** 3 | **Priority:** Critical | **Stack:** Next.js 14, MongoDB/Mongoose, Google Custom Search API

## Architecture Constraints
- No Redis/BullMQ - use API polling
- Google API: 100 requests/day, 10 results/page
- Global scope, JWT auth
- Follow existing patterns (CredentialService, DorkBulkService)

---

## Task 3.1: Database Models (2h)

### QueryCombo Model
**File:** `src/db/models/QueryCombo.ts`

**Fields:**
```typescript
locationId, categoryId, dorkId: ObjectId (refs, required)
dorkString, credentialId: String/ObjectId (required)
totalResultsFetched, lastStartIndex, nextStartIndex: Number
maxAllowedResults: Number (default: 100)
status: enum ['pending','running','paused','completed','failed']
errorMessage, lastRunAt, completedAt: Optional
timestamps: true
```

**Indexes:**
- Unique: `{locationId:1, categoryId:1, dorkId:1}`
- Single: `{status:1}`, `{createdAt:-1}`

### QueryLink Model
**File:** `src/db/models/QueryLink.ts`

**Fields:**
```typescript
queryComboId: ObjectId (ref, required)
url, canonicalUrl, title, snippet: String (required)
displayLink, formattedUrl: String (optional)
rank, pageNumber: Number (optional)
fetchedAt: Date (default: now)
timestamps: true
```

**Indexes:**
- Unique: `{queryComboId:1, canonicalUrl:1}`
- Single: `{queryComboId:1}`, `{fetchedAt:-1}`

**Checklist:**
- [ ] Models follow existing patterns (Credential.ts, Dork.ts)
- [ ] Compound unique constraints work
- [ ] Export in `src/db/models/index.ts`
- [ ] Add interfaces to `src/types/index.ts`

---

## Task 3.2: Google Search Service (3h)

**File:** `src/lib/services/google/GoogleSearchService.ts`

**Functions:**
```typescript
searchGoogleDork(dorkString, credentialId, startIndex): Promise<GoogleSearchAPIResponse>
normalizeSearchResults(apiResponse, queryComboId): NormalizedSearchResult[]
getDecryptedCredential(credentialId): Promise<{apiKey, engineId}>
hasNextPage(apiResponse, currentTotal, maxAllowed): boolean
calculateNextStartIndex(currentStart, pageSize=10): number
```

**API Integration:**
- Endpoint: `https://www.googleapis.com/customsearch/v1`
- Params: `key`, `cx`, `q`, `start`, `num`
- Handle 429 (rate limit), 403 (quota), network errors

**Error Types:**
```typescript
GoogleSearchError {
  code: 'RATE_LIMIT' | 'QUOTA_EXCEEDED' | 'INVALID_CREDENTIAL' | 'NETWORK_ERROR'
  message: string
  retryAfter?: number
}
```

**Checklist:**
- [ ] Pure functions, no side effects
- [ ] Use existing logger utility
- [ ] Decrypt credentials via existing encryption
- [ ] Extend `src/types/google.types.ts`

---

## Task 3.3: URL Utils (1.5h)

**File:** `src/lib/utils/urlUtils.ts`

**Functions:**
```typescript
canonicalizeUrl(url): string // lowercase, remove trailing slash, UTM params, normalize protocol
extractDomain(url): string
isValidUrl(url): boolean
removeTrackingParams(url): string
TRACKING_PARAMS: string[] // utm_*, fbclid, gclid, etc.
```

**Checklist:**
- [ ] Deterministic canonicalization
- [ ] Handle malformed URLs
- [ ] JSDoc with examples

---

## Task 3.4: Query Service (3h)

**File:** `src/lib/services/query/QueryService.ts`

**Core Functions:**
```typescript
createOrGetQueryCombo(input): Promise<IQueryCombo> // idempotent
getQueryComboById(id): Promise<IQueryCombo>
getQueryStatus(id): Promise<{status, totalFetched, progress, canFetchMore}>
updateQueryProgress(id, {insertedCount, lastStart, nextStart}): Promise<void>
markQueryFailed(id, error): Promise<void>
markQueryCompleted(id): Promise<void>
pauseQuery(id), resumeQuery(id), resetQuery(id): Promise<void>
listQueryCombos(params): Promise<{data, total}>
getQueryResults(id, params): Promise<{data, total}>
insertQueryLinks(comboId, links): Promise<number> // returns inserted count
deleteQueryLinks(id): Promise<number>
```

**Checklist:**
- [ ] Follow CredentialService pattern
- [ ] Atomic updates
- [ ] Handle duplicate key errors gracefully
- [ ] Use logger utility

---

## Task 3.5: Query Execution Service (4h)

**File:** `src/lib/services/query/QueryExecutionService.ts`

**Functions:**
```typescript
executeQueryPage(queryId): Promise<{success, insertedCount, hasMore, error?}>
canExecuteQuery(queryId): Promise<{canExecute, reason?}>
getExecutableQueries(): Promise<IQueryCombo[]>
processQueryExecution(queryId): Promise<void>
```

**Execution Flow (executeQueryPage):**
1. Load QueryCombo, validate status
2. Check limits (nextStartIndex vs maxAllowedResults)
3. Get decrypted credential
4. Call Google API
5. Normalize & canonicalize URLs
6. Insert links (handle duplicates)
7. Update progress
8. Check completion
9. Handle errors (rate limit → pause, quota → fail, network → retry 3x)

**Checklist:**
- [ ] Atomic page execution
- [ ] Comprehensive error handling
- [ ] Accurate progress tracking
- [ ] Deduplication via unique index

---

## Task 3.6: API - Create/Run Query (2h)

### POST /api/queries/run
**File:** `src/app/api/queries/run/route.ts`

**Body:** `{locationId, categoryId, dorkId, credentialId, maxAllowedResults?}`  
**Response:** `{success, data: {queryId, status, message}}`

**Logic:**
1. Validate JWT (middleware)
2. Validate body & check IDs exist
3. Fetch dorkString from Dork
4. Call `createOrGetQueryCombo`
5. Return queryId

### GET /api/queries/[id]
**File:** `src/app/api/queries/[id]/route.ts`

**Response:** Full query details with populated refs (location, category, dork names)

**Checklist:**
- [ ] Validation comprehensive
- [ ] Populate references
- [ ] Calculate progress percentage

---

## Task 3.7: API - Execute Query Page (2h)

### POST /api/queries/[id]/execute
**File:** `src/app/api/queries/[id]/execute/route.ts`

**Response:** `{success, data: {insertedCount, totalFetched, hasMore, status}}`

**Logic:**
1. Check execution lock (prevent concurrent runs)
2. Call `canExecuteQuery`
3. Call `executeQueryPage`
4. Release lock
5. Return result

### Query Lock Service
**File:** `src/lib/services/query/QueryLockService.ts`

```typescript
const executionLocks = new Map<string, boolean>()
acquireLock(queryId): boolean
releaseLock(queryId): void
isLocked(queryId): boolean
```

**Checklist:**
- [ ] In-memory lock prevents race conditions
- [ ] Idempotent execution
- [ ] Lock released on error

---

## Task 3.8: API - Query Management (2h)

**Files:**
- `src/app/api/queries/[id]/pause/route.ts` - POST
- `src/app/api/queries/[id]/resume/route.ts` - POST
- `src/app/api/queries/[id]/reset/route.ts` - POST (destructive)

**Logic:** Call respective service functions, return `{success, message}`

**Checklist:**
- [ ] Status transitions logical
- [ ] Reset clears links & counters

---

## Task 3.9: API - List Queries (2h)

### GET /api/queries
**File:** `src/app/api/queries/route.ts`

**Params:** `status, locationId, categoryId, dorkId, search, page, limit, sortBy, sortOrder`  
**Response:** `{success, data: {queries[], pagination}}`

**Checklist:**
- [ ] Filtering works
- [ ] Pagination accurate
- [ ] Populate refs
- [ ] Calculate progress

---

## Task 3.10: API - Filter Options (2h)

### GET /api/filter-options
**File:** `src/app/api/filter-options/route.ts`

**Params:** `locationId?, categoryId?, dorkId?`  
**Response:** `{locations[], categories[], dorks[]}` with counts

**Logic:** Use aggregation to filter options based on existing QueryCombos

**Example:**
```typescript
// Get categories for locationId
QueryCombo.aggregate([
  {$match: {locationId}},
  {$group: {_id: '$categoryId', count: {$sum: 1}}},
  {$lookup: {from: 'categories', localField: '_id', foreignField: '_id', as: 'category'}},
  {$project: {id: '$_id', name: '$category.name', count: 1}}
])
```

**Checklist:**
- [ ] Dependent filtering works
- [ ] Counts accurate
- [ ] Performance acceptable

---

## Task 3.11: API - Query Results (1.5h)

### GET /api/queries/[id]/results
**File:** `src/app/api/queries/[id]/results/route.ts`

**Params:** `page, limit, sortBy, sortOrder`  
**Response:** `{success, data: {results[], pagination}}`

**Checklist:**
- [ ] Pagination works
- [ ] Sorting accurate

---

## Task 3.12: API - Export CSV (2h)

### GET /api/queries/[id]/export
**File:** `src/app/api/queries/[id]/export/route.ts`

**Response:** CSV file download

**Columns:** URL, Title, Snippet, Display Link, Fetched At, Page Number, Rank

**Headers:**
```typescript
'Content-Type': 'text/csv'
'Content-Disposition': 'attachment; filename="query-results-{id}-{timestamp}.csv"'
```

**Checklist:**
- [ ] Stream for large datasets
- [ ] Proper CSV escaping
- [ ] Filename descriptive

---

## Task 3.13: UI - Query Run Form (3h)

**File:** `src/components/queries/QueryRunForm.tsx`

**Features:**
- Dropdowns: Location, Category, Dork (from `/api/filter-options`)
- Credential dropdown
- Max results input (default 100)
- Dork string preview
- Run button → POST `/api/queries/run`
- Success toast with link to query details

**Page:** `src/app/(dashboard)/queries/new/page.tsx`

**Checklist:**
- [ ] Dependent dropdowns work
- [ ] Validation on submit
- [ ] Loading states
- [ ] Error handling

---

## Task 3.14: UI - Queries Table (4h)

**File:** `src/components/queries/QueriesTable.tsx`  
**Page:** `src/app/(dashboard)/queries/page.tsx`

**Features:**
- Columns: Dork, Category, Location, Status, Progress, Total Results, Created, Actions
- Status badges (color-coded)
- Progress bar per row
- Polling (3s) for running queries via SWR
- Actions: View Details, Pause, Resume, Reset
- Filters: Status, Location, Category, Dork
- Pagination

**Checklist:**
- [ ] Polling limited to running queries
- [ ] Actions trigger API calls
- [ ] Filters work
- [ ] Progress bar accurate

---

## Task 3.15: UI - Query Details & Results (3h)

**File:** `src/app/(dashboard)/queries/[id]/page.tsx`

**Sections:**
1. **Metadata Card:** Dork string, location, category, status, progress bar, error message
2. **Actions:** Pause/Resume, Reset, Export CSV, Execute Page (manual trigger)
3. **Results Table:** URL, Title, Snippet, Fetched At (paginated)

**Polling:** Poll status every 3s if status is 'running'

**Checklist:**
- [ ] Metadata updates in real-time
- [ ] Results pagination works
- [ ] Actions functional
- [ ] Export downloads CSV

---

## Task 3.16: UI - Auto-Execution Polling (2h)

**File:** `src/components/queries/QueryAutoExecutor.tsx`

**Purpose:** Auto-execute queries with status 'running' or 'pending'

**Logic:**
1. Component mounts on queries list page
2. Poll `/api/queries?status=running,pending` every 5s
3. For each query, call `/api/queries/[id]/execute`
4. Handle rate limits (pause polling if 429)
5. Update UI on completion

**Alternative:** Server-side cron (Next.js API route with cron trigger)

**Checklist:**
- [ ] Polling doesn't overwhelm API
- [ ] Handles errors gracefully
- [ ] Can be paused/stopped

---

## Task 3.17: Validators (1h)

**File:** `src/lib/validators/query.validators.ts`

**Schemas:**
```typescript
CreateQuerySchema: {locationId, categoryId, dorkId, credentialId, maxAllowedResults?}
QueryFilterSchema: {status?, locationId?, categoryId?, dorkId?, search?, page?, limit?}
```

Use Zod (if existing) or custom validation

**Checklist:**
- [ ] All fields validated
- [ ] ObjectId format checked
- [ ] Ranges enforced

---

## Implementation Order

1. **Backend Foundation (Days 1-2):**
   - Task 3.1: Models
   - Task 3.3: URL Utils
   - Task 3.2: Google Service
   - Task 3.4: Query Service

2. **Execution Layer (Day 3):**
   - Task 3.5: Execution Service
   - Task 3.7: Execute API

3. **API Routes (Day 4):**
   - Task 3.6: Create/Run API
   - Task 3.8: Management APIs
   - Task 3.9: List API
   - Task 3.10: Filter Options API
   - Task 3.11: Results API
   - Task 3.12: Export API

4. **Frontend (Days 5-6):**
   - Task 3.13: Run Form
   - Task 3.14: Queries Table
   - Task 3.15: Query Details
   - Task 3.16: Auto-Executor

5. **Polish (Day 7):**
   - Task 3.17: Validators
   - Testing & bug fixes

---

## Testing Checklist

- [ ] Create query combo (new & existing)
- [ ] Execute single page
- [ ] Handle duplicates
- [ ] Pause/resume/reset
- [ ] Rate limit handling
- [ ] Quota exceeded handling
- [ ] Export CSV
- [ ] Dependent dropdowns
- [ ] Pagination
- [ ] Polling mechanism

---

## Environment Variables

```env
MONGODB_URI=mongodb://...
GOOGLE_API_KEY=... (or stored in Credential model)
ENCRYPTION_KEY=... (existing)
JWT_SECRET=... (existing)
```

---

## Notes

- **No Worker Process:** All execution via API routes with client-side polling
- **Rate Limiting:** Handle 429 by pausing query, not retrying immediately
- **Deduplication:** Rely on unique index `{queryComboId, canonicalUrl}`
- **Progress Tracking:** Calculate as `(totalResultsFetched / maxAllowedResults) * 100`
- **Status Flow:** `pending → running → completed/failed/paused`
- **Logging:** Use existing `src/lib/utils/logger.ts`
