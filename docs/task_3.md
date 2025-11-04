# Phase 3 Tasks: Module 4 — Query Builder + Result Scraper

Module 4 provides an end-to-end flow for selecting Location–Business–Dork combinations, formatting Google dork queries, executing paginated searches (up to 10 pages × 10 results), storing results, and exposing progress and statistics to the UI.

- Framework: Next.js App Router (server routes under `src/app/api`)
- DB: MongoDB with Mongoose models (under `src/db/models`)
- UI: React 19, Tailwind v4, shadcn/ui, TanStack Query/Table
- Conventions: Use path aliases from `docs/context.md`. Protect APIs as needed via existing auth middleware.

---

## End-to-End Flow (Backend → Frontend)

1. Backend: Master data endpoints provide dropdown data for Locations, Businesses, Dorks.
2. Frontend: User selects Location, Business, Dork, and Credential → Submits form.
3. Backend: `POST /api/queries/create` validates inputs, formats the query, creates a Query record (status `pending`), and asynchronously starts the scraper job.
4. Backend: Scraper job iterates pages (1..10), calls Google Custom Search, extracts links, upserts into `Result`, updates `Query.currentPage`, `Query.totalResults`, and `Query.status`.
5. Backend: `GET /api/queries/[id]` returns real-time Query status and counters; `GET /api/queries/[id]/results` returns paginated links; `GET /api/queries/stats` returns aggregated counts by combination.
6. Frontend: Query Details page polls status and results to render progress and tables; Statistics Dashboard shows live aggregates; Queries List provides filters/search and navigation.

---

## Dependencies & Prerequisites

- Auth system and middleware enabled for protected endpoints
- MongoDB connection via `src/db/mongodb.ts`
- Credential storage and decryption utilities available (used by Google Search service)
- Types in `src/types/query.ts` (will be referenced/augmented)

---

## Task 4.1: Database Models & Schema
- Priority: Critical
- Estimate: 2 hours

### Deliverables
- `src/db/models/Query.ts`
  - Fields: `id`, `locationId`, `businessId`, `dorkId`, `formattedQuery`, `status` ('pending' | 'scraping' | 'completed' | 'failed'), `totalResults` (default 0), `currentPage` (default 0), `createdAt`, `completedAt` (nullable), `error` (nullable string)
  - Unique compound index on `(locationId, businessId, dorkId)`
- `src/db/models/Result.ts`
  - Fields: `id`, `queryId`, `locationId`, `businessId`, `dorkId`, `link`, `createdAt`
  - Index on `queryId`
  - Compound index on `(locationId, businessId, dorkId)` for fast aggregation

### Acceptance Criteria
- Unique constraint rejects duplicate combinations
- Correct references: `Result.queryId` → `Query._id`
- Indexes support fast count/aggregation and per-query lookups
- Status transitions supported: pending → scraping → completed/failed

---

## Task 4.2: Query Formatter Service
- Priority: High
- Estimate: 1 hour

### Deliverables
- `src/lib/services/queryFormatter.ts`
  - `formatDorkQuery(locationId, businessId, dorkId)`
  - Fetch Location, Business, Dork; substitute placeholders like `{LOCATION}`, `{BUSINESS}`
  - Return URL-safe query string (encode as needed)

### Acceptance Criteria
- Replaces placeholders correctly
- Throws descriptive errors on missing records
- Output safe for Google Custom Search API `q` parameter

---

## Task 4.3: Google Search Service
- Priority: Critical
- Estimate: 3 hours

### Deliverables
- `src/lib/services/googleSearchService.ts`
  - `searchGoogleDork(queryString, startIndex, credentialId)`
  - Decrypt/resolve credentials (key, cx) from DB
  - Call Google Custom Search: params `{ key, cx, q, start }` where `start` ∈ [1, 11, 21, …, 91]
  - Return `{ links: string[], hasNextPage: boolean }`
  - Handle HTTP errors and rate limits (429, 403), with backoff policy hook

### Acceptance Criteria
- Correct API construction and pagination handling
- Extract only URLs from items
- Detect `queries.nextPage` or infer paging cutoff
- Do not exceed 10 pages (startIndex 91 max)

---

## Task 4.4: Scraper Service (Async Job)
- Priority: Critical
- Estimate: 4 hours

### Deliverables
- `src/lib/services/scraperService.ts`
  - `startScrapeJob(queryId)` async
  - Load Query → set status `scraping`
  - Loop pages 1..10 (start indices 1, 11, …, 91)
  - Per page: call `searchGoogleDork`, batch insert links into `Result`
  - Update `Query.currentPage`, `Query.totalResults` (incremental)
  - Stop early if no next page
  - On success: set status `completed`, set `completedAt`
  - On error: set status `failed`, store `error`
  - Logging for diagnostics

### Acceptance Criteria
- Pagination stops at 10 pages or when `hasNextPage === false`
- Results saved incrementally; duplicates prevented by unique+upsert (optional)
- Query progress updated after each page
- Robust error handling and status updates

---

## Task 4.5: Query Creation API
- Priority: Critical
- Estimate: 2 hours

### Deliverables
- `POST /api/queries/create`
  - Body: `{ locationId, businessId, dorkId, credentialId }`
  - Validate existence of IDs
  - Check duplicate combination (return existing Query if found)
  - Format query via `queryFormatter`
  - Create Query with status `pending` and `formattedQuery`
  - Trigger `startScrapeJob()` asynchronously (non-blocking)
  - Return `{ queryId, status: 'pending', message: 'Scraping started' }`

### Acceptance Criteria
- Returns immediately without waiting for scraping
- Prevents duplicate combos
- Starts background job successfully
- Proper 4xx/5xx errors on validation/DB failures

### Files
- `src/app/api/queries/create/route.ts`

---

## Task 4.6: Query Status & Statistics API
- Priority: High
- Estimate: 2 hours

### Deliverables
- `GET /api/queries/[id]`
  - Returns Query with `status`, `totalResults`, `currentPage`, and populated names (location, business, dork)
- `GET /api/queries/stats`
  - Aggregates by `(locationId, businessId, dorkId)` → `{ locationId, businessId, dorkId, totalLinks, lastUpdated }`

### Acceptance Criteria
- Status endpoint reflects near-real-time data
- Stats endpoint efficient with indexes
- Proper 400/404 for invalid IDs

### Files
- `src/app/api/queries/[id]/route.ts`
- `src/app/api/queries/stats/route.ts`

---

## Task 4.7: Master Data API (Dropdowns)
- Priority: High
- Estimate: 1.5 hours

### Deliverables
- `GET /api/locations` → `[{ id, name }]`
- `GET /api/businesses` → `[{ id, name }]`
- `GET /api/dorks` → `[{ id, name, template }]`

### Acceptance Criteria
- Consistent JSON shape
- Sorted by `name` asc
- Cached/optimized for frequent reads

### Files
- `src/app/api/locations/route.ts`
- `src/app/api/businesses/route.ts`
- `src/app/api/dorks/route.ts`

---

## Task 4.8: Query Builder Form UI
- Priority: High
- Estimate: 3 hours

### Deliverables
- `src/components/queries/QueryBuilderForm.tsx`
  - Fetch dropdown data on mount (locations, businesses, dorks, credentials)
  - Show selection preview of the dork template substitution
  - Submit → call `/api/queries/create`
  - Success toast with `queryId` and link to details page
  - Reset form on success

### Acceptance Criteria
- All fields required
- Loading/disabled state during submit
- Error toasts for failures
- Uses shadcn/ui + React Hook Form + zod

---

## Task 4.9: Statistics Dashboard
- Priority: High
- Estimate: 3 hours

### Deliverables
- `src/components/queries/QueryStatsTable.tsx`
  - Fetch from `/api/queries/stats`
  - Columns: Location, Business, Dork, Total Links, Status (derived), Last Updated
  - Auto-refresh every 5s for active scrapes
  - Filters by location/business; search input
  - Export CSV
- Page: `src/app/(dashboard)/query-stats/page.tsx`

### Acceptance Criteria
- Displays all combos with counts
- Live updates while any jobs active
- Status badges colored, responsive table
- CSV export works

---

## Task 4.10: Query Details & Results Page
- Priority: Medium
- Estimate: 2.5 hours

### Deliverables
- Page: `src/app/(dashboard)/queries/[id]/page.tsx`
  - Metadata (location, business, dork), `status`, progress bar (`currentPage / 10`)
  - Results table (20/page) with pagination
  - Poll every 3s while `status` ∈ {`pending`, `scraping`}
  - Download links (CSV)
- Components: `src/components/queries/QueryProgress.tsx`, `src/components/queries/ResultsTable.tsx`
- API for paginated results: `GET /api/queries/[id]/results`

### Acceptance Criteria
- Live progress bar updates
- Paginated results (20 per page)
- Stops polling on `completed`/`failed`
- CSV export correct

---

## Task 4.11: Query List Page
- Priority: Medium
- Estimate: 2 hours

### Deliverables
- Page: `src/app/(dashboard)/queries/page.tsx`
- Component: `src/components/queries/QueriesListTable.tsx`
- API: `GET /api/queries` with query params for pagination, search, and status filter
  - Columns: Location, Business, Dork, Status, Results Count, Created Date
  - Filters: All, Pending, Scraping, Completed, Failed
  - Search by location/business (case-insensitive)

### Acceptance Criteria
- Lists queries with pagination
- Filters and search work
- Status badges and responsive layout

---

## Technical Notes & Conventions
- Use `@tanstack/react-query` for fetching/polling.
- Use `@tanstack/react-table` for tables and CSV export utility.
- Validate requests with `zod`; unify API error response shape.
- Prefer server-side data shaping for table needs.
- Respect alias imports per `docs/context.md`.
- Ensure all protected endpoints use auth middleware as applicable.
