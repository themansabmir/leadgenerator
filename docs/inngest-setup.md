# Inngest Setup Guide

## Overview

Inngest handles background execution of query combos, automatically fetching all pages with built-in retries and rate limiting.

## Architecture

```
User creates query
    ↓
POST /api/queries/run
    ↓
Inngest event triggered: query/execute.requested
    ↓
Inngest Function: executeQuery
    ↓
Loop: Execute pages until complete
    ├── Step 1: Execute page
    ├── Step 2: Rate limit delay (1s)
    └── Repeat until hasMore = false
    ↓
Query completed
```

## Local Development Setup

### 1. Install Inngest Dev Server

```bash
npx inngest-cli@latest dev
```

This starts the Inngest Dev Server at `http://localhost:8288`

### 2. Start Your Next.js App

```bash
npm run dev
```

### 3. Access Inngest Dashboard

Open `http://localhost:8288` to see:
- Function executions
- Event history
- Step-by-step execution logs
- Retry attempts

## Production Setup

### 1. Create Inngest Account

Visit [inngest.com](https://www.inngest.com) and sign up for free.

### 2. Get Your Signing Key

1. Go to your Inngest dashboard
2. Navigate to Settings → Keys
3. Copy your Event Key and Signing Key

### 3. Add Environment Variables

Add to your `.env.production`:

```env
INNGEST_EVENT_KEY=your_event_key_here
INNGEST_SIGNING_KEY=your_signing_key_here
```

### 4. Deploy

Deploy your Next.js app. Inngest will automatically discover your functions at `/api/inngest`.

### 5. Sync Functions

In Inngest dashboard:
1. Go to Apps
2. Click "Sync" to register your functions
3. Verify `execute-query` function appears

## How It Works

### Query Creation Flow

1. **User creates query** via `/api/queries/run`
2. **Query combo created** in database with status `pending`
3. **Inngest event sent**: `query/execute.requested`
4. **API returns immediately** (non-blocking)
5. **Inngest executes in background**:
   - Connects to database
   - Executes first page
   - If successful and hasMore, waits 1s
   - Executes next page
   - Repeats until complete or error
6. **Frontend polls** every 3s to show real-time progress

### Resume Flow

1. **User clicks Resume** on paused query
2. **Status updated** to `pending` via `/api/queries/[id]/resume`
3. **Inngest event sent**: `query/execute.requested`
4. **Execution continues** from last checkpoint

### Error Handling

- **Network errors**: Automatic retry (3 attempts per step)
- **Rate limit errors**: Query paused, can be resumed later
- **API errors**: Query marked as failed with error message
- **Quota exceeded**: Query marked as failed

## Features

### Built-in Retries

Each page execution automatically retries up to 3 times on failure with exponential backoff.

### Rate Limiting

1-second delay between pages to respect API rate limits.

### Observability

Full execution history in Inngest dashboard:
- See each step execution
- View input/output data
- Track retry attempts
- Monitor execution time

### Step Functions

Each page is a separate step, allowing:
- Individual step retries
- Granular error tracking
- Resume from last successful step

## Monitoring

### Inngest Dashboard

Monitor your queries at `https://app.inngest.com`:

- **Functions**: View all registered functions
- **Runs**: See execution history
- **Events**: Track all triggered events
- **Logs**: Debug with detailed logs

### Application Logs

Query execution logs in your application:

```typescript
logInfo('Inngest: Starting query execution', { queryId });
logInfo('Inngest: Page executed', { pageNumber, insertedCount });
logError('Inngest: Query execution failed', { error, errorCode });
```

## Testing

### Test Query Execution

1. Create a query via UI or API
2. Check Inngest dashboard for event
3. Watch step-by-step execution
4. Verify results in database

### Test Error Scenarios

1. **Invalid credentials**: Query should fail with error message
2. **Rate limit**: Query should pause, can be resumed
3. **Network error**: Should auto-retry 3 times

## Troubleshooting

### Functions Not Appearing

1. Ensure dev server is running: `npx inngest-cli@latest dev`
2. Check Next.js app is running
3. Visit `http://localhost:8288/dev` to sync functions

### Events Not Triggering

1. Check Inngest event logs in dashboard
2. Verify event name matches: `query/execute.requested`
3. Check application logs for errors

### Execution Failures

1. View detailed logs in Inngest dashboard
2. Check step that failed
3. Review error message and retry attempts
4. Verify database connection and credentials

## Cost

### Free Tier

- 1,000 function runs/month
- 100 concurrent executions
- 7-day log retention
- Perfect for development and small projects

### Paid Plans

Scale as needed with higher limits and longer retention.

## Next Steps

1. Start Inngest dev server
2. Create a test query
3. Monitor execution in dashboard
4. Deploy to production with environment variables
