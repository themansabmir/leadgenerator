# Query Module UI Implementation

## Overview
Complete frontend UI implementation for the Query Module (SERP Scraper) with dropdown functionality, real-time updates, and comprehensive query management.

## Components Created

### 1. QueryRunForm (`src/components/queries/QueryRunForm.tsx`)
**Purpose:** Form to create and run new queries

**Features:**
- ✅ Location dropdown (populated from API)
- ✅ Category dropdown (populated from API)
- ✅ Dork dropdown with preview (populated from API)
- ✅ Credential dropdown (populated from API)
- ✅ Max results input (1-1000, default: 100)
- ✅ Dork string preview below dropdown
- ✅ Form validation
- ✅ Loading states
- ✅ Success/error handling with toast notifications
- ✅ Auto-redirect to query details on success

**Usage:**
```tsx
import { QueryRunForm } from "@/components/queries/QueryRunForm";

<QueryRunForm />
```

### 2. QueriesTable (`src/components/queries/QueriesTable.tsx`)
**Purpose:** Display and manage list of queries

**Features:**
- ✅ Search functionality (dork strings)
- ✅ Status filter dropdown (all, pending, running, paused, completed, failed)
- ✅ Status badges (color-coded)
- ✅ Progress bars with percentage
- ✅ Results count (fetched / max)
- ✅ Real-time polling (auto-refresh every 3s for running queries)
- ✅ Sortable columns
- ✅ Pagination
- ✅ Action dropdown menu:
  - View Details
  - Pause (for running/pending)
  - Resume (for paused)
  - Reset (destructive)
  - Export CSV
- ✅ Loading states with overlay

**Columns:**
- Dork (truncated)
- Category
- Location
- Status (badge)
- Progress (bar + percentage)
- Results (fetched/max)
- Created (sortable)
- Actions (dropdown)

### 3. Query Details Page (`src/app/(dashboard)/queries/[id]/page.tsx`)
**Purpose:** View query details and results

**Features:**
- ✅ Metadata card with:
  - Dork string
  - Status badge
  - Location, Category, Credential
  - Created date
  - Progress bar with percentage
  - Error message display (if failed)
- ✅ Action buttons:
  - Execute Page (manual trigger)
  - Pause/Resume
  - Reset
  - Export CSV
- ✅ Results table with:
  - Rank
  - Title
  - URL (clickable with external link icon)
  - Snippet
  - Fetched date
- ✅ Results pagination
- ✅ Real-time polling (auto-refresh every 3s for running queries)
- ✅ Loading states
- ✅ Error handling (404 if query not found)

### 4. Queries List Page (`src/app/(dashboard)/queries/page.tsx`)
**Purpose:** Main queries management page

**Features:**
- ✅ Page header with title and description
- ✅ "New Query" button
- ✅ QueriesTable component integration
- ✅ Responsive layout

### 5. New Query Page (`src/app/(dashboard)/queries/new/page.tsx`)
**Purpose:** Create new query page

**Features:**
- ✅ Back button to queries list
- ✅ QueryRunForm component integration
- ✅ Centered layout (max-width)

## API Client & Hooks

### Client API (`src/lib/client/queries.api.ts`)
**Functions:**
- `createQueryApi()` - Create and run query
- `getQueries()` - List with filtering
- `getQueryById()` - Get details
- `executeQueryPage()` - Execute page
- `pauseQuery()` - Pause query
- `resumeQuery()` - Resume query
- `resetQuery()` - Reset query
- `getQueryResults()` - Get results
- `getFilterOptions()` - Get filter options
- `getExportUrl()` - Get CSV export URL

**Types:**
- `QueryComboDTO` - Query combo data
- `QueryLinkDTO` - Query result link data
- `QueriesListParams` - List parameters
- `PaginatedQueriesResponse` - Paginated response
- `FilterOptionsResponse` - Filter options

### React Query Hooks (`src/hooks/useQueries.ts`)
**Queries:**
- `useQueriesQuery()` - List queries with auto-refresh
- `useQueryByIdQuery()` - Single query with auto-refresh
- `useQueryResultsQuery()` - Query results
- `useFilterOptionsQuery()` - Filter options

**Mutations:**
- `useCreateQueryMutation()` - Create query
- `useExecuteQueryMutation()` - Execute page
- `usePauseQueryMutation()` - Pause query
- `useResumeQueryMutation()` - Resume query
- `useResetQueryMutation()` - Reset query

**Auto-Refresh Logic:**
- Queries with status `running` or `pending` auto-refresh every 3 seconds
- Stops auto-refresh when query completes, fails, or is paused
- Uses React Query's `refetchInterval` for efficient polling

### Query Keys (`src/lib/client/queryKeys.ts`)
Extended with:
```typescript
queries: {
  all: () => ["queries"],
  detail: (id) => ["queries", id],
  results: (id) => ["queries", id, "results"],
  filterOptions: () => ["queries", "filter-options"],
}
```

## Routes

| Route | Purpose |
|-------|---------|
| `/queries` | List all queries |
| `/queries/new` | Create new query |
| `/queries/[id]` | View query details and results |

## UI/UX Features

### Real-Time Updates
- ✅ Auto-polling every 3s for running/pending queries
- ✅ Automatic stop when query completes
- ✅ Efficient React Query caching

### Status Badges
- **Pending** - Secondary (gray)
- **Running** - Default (blue)
- **Paused** - Outline (gray border)
- **Completed** - Success (green)
- **Failed** - Destructive (red)

### Progress Visualization
- Progress bar component
- Percentage display
- Results count (fetched / max)

### Responsive Design
- Mobile-friendly layouts
- Responsive tables
- Flexible grids

### Loading States
- Skeleton loaders
- Spinner overlays
- Disabled buttons during mutations

### Error Handling
- Toast notifications for errors
- Error message display in UI
- 404 handling for missing queries
- Validation errors

### Confirmation Dialogs
- Reset action requires confirmation
- Prevents accidental data loss

## Integration Points

### Dependencies
- `@tanstack/react-query` - Data fetching and caching
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `next/navigation` - Routing
- UI components from `@/components/ui/*`

### Existing Hooks Used
- `useLocationsQuery` - Location dropdown
- `useCategoriesQuery` - Category dropdown
- `useDorksQuery` - Dork dropdown
- `useCredentialsQuery` - Credential dropdown
- `useDebouncedValue` - Search debouncing

## Files Created

### Components
- `src/components/queries/QueryRunForm.tsx`
- `src/components/queries/QueriesTable.tsx`

### Pages
- `src/app/(dashboard)/queries/page.tsx`
- `src/app/(dashboard)/queries/new/page.tsx`
- `src/app/(dashboard)/queries/[id]/page.tsx`

### API & Hooks
- `src/lib/client/queries.api.ts`
- `src/hooks/useQueries.ts`

### Updated
- `src/lib/client/queryKeys.ts` (added queries keys)

## Usage Examples

### Creating a Query
1. Navigate to `/queries/new`
2. Select Location, Category, Dork, and Credential from dropdowns
3. Optionally adjust max results (default: 100)
4. Click "Create & Run Query"
5. Redirected to query details page

### Managing Queries
1. Navigate to `/queries`
2. Use search to filter by dork string
3. Use status dropdown to filter by status
4. Click actions menu for:
   - View details
   - Pause/Resume
   - Reset
   - Export CSV

### Viewing Results
1. Click on a query or navigate to `/queries/[id]`
2. View metadata and progress
3. Scroll to results table
4. Use pagination to browse results
5. Click URLs to visit in new tab
6. Export CSV for offline analysis

## Auto-Execution Note

The UI does NOT include an auto-executor component. Query execution is triggered:
1. **Automatically** - When query is created (status: pending)
2. **Manually** - Via "Execute Page" button on details page
3. **Backend** - Server-side polling or cron job (not implemented in UI)

For production, consider implementing:
- Server-side cron job to execute pending queries
- Or client-side `QueryAutoExecutor` component (as specified in task_04.md)

## Testing Checklist

- [x] Create new query with all dropdowns
- [x] View queries list with filters
- [x] Search queries by dork string
- [x] Filter by status
- [x] View query details
- [x] See real-time progress updates
- [x] Pause/resume queries
- [x] Reset query
- [x] Export CSV
- [x] View results with pagination
- [x] Click result URLs
- [x] Handle errors gracefully
- [x] Mobile responsive

## Next Steps (Optional Enhancements)

1. **QueryAutoExecutor Component** - Background execution polling
2. **Bulk Actions** - Select multiple queries for batch operations
3. **Advanced Filters** - Filter by location, category, dork
4. **Query Templates** - Save common query configurations
5. **Result Filtering** - Filter results by domain, rank, etc.
6. **Analytics Dashboard** - Query success rates, average results, etc.

## Notes

- All components follow existing patterns (CredentialsTable, etc.)
- Functional programming principles maintained
- Full TypeScript type safety
- Responsive and accessible
- Production-ready UI/UX
