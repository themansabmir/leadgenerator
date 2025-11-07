# Next.js 15 Params Fix

## Issue
Next.js 15 changed dynamic route parameters to be Promises that must be awaited before accessing their properties.

## Error
```
Error: Route "/api/queries/[id]" used `params.id`. `params` is a Promise and must be unwrapped with `await` or `React.use()` before accessing its properties.
```

## Solution
Updated all API routes with dynamic parameters to:
1. Change params type from `{ params: { id: string } }` to `{ params: Promise<{ id: string }> }`
2. Await params before accessing: `const { id } = await params;`

## Files Updated

### Query API Routes (7 files)
- ✅ `/api/queries/[id]/route.ts` - GET query details
- ✅ `/api/queries/[id]/execute/route.ts` - POST execute page
- ✅ `/api/queries/[id]/pause/route.ts` - POST pause query
- ✅ `/api/queries/[id]/resume/route.ts` - POST resume query
- ✅ `/api/queries/[id]/reset/route.ts` - POST reset query
- ✅ `/api/queries/[id]/results/route.ts` - GET query results
- ✅ `/api/queries/[id]/export/route.ts` - GET export CSV

## Pattern Used

**Before (Next.js 14):**
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const parsed = queryIdParamSchema.safeParse({ id: params.id });
  // ...
}
```

**After (Next.js 15):**
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await params (Next.js 15 requirement)
  const { id } = await params;
  
  const parsed = queryIdParamSchema.safeParse({ id });
  // ...
}
```

## Additional Changes
- Removed `params.id` from error logging contexts
- For execute route: Added `queryId` variable to track ID for lock release in finally block

## Status
✅ All query API routes updated and compatible with Next.js 15
