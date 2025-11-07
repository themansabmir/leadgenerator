# Inngest Quick Start

## What Changed?

Queries now execute automatically in the background using Inngest. No more manual execution needed!

## Local Development (3 Steps)

### 1. Install Inngest Dev Server

```bash
npx inngest-cli@latest dev
```

Leave this running in a terminal. It starts at `http://localhost:8288`

### 2. Start Your App

```bash
npm run dev
```

### 3. Test It!

1. Create a query via the UI
2. Watch it execute automatically
3. View execution in Inngest dashboard: `http://localhost:8288`

**That's it!** No environment variables needed for local dev.

## How It Works

```
Create Query → Inngest Event → Background Execution → All Pages Fetched
```

- **Automatic retries** on failures (3 attempts per page)
- **Rate limiting** (1s delay between pages)
- **Real-time progress** via frontend polling
- **Full observability** in Inngest dashboard

## Production Deployment

1. Sign up at [inngest.com](https://www.inngest.com) (free tier available)
2. Get your keys from Settings → Keys
3. Add to `.env.production`:
   ```env
   INNGEST_EVENT_KEY=your_key
   INNGEST_SIGNING_KEY=your_key
   ```
4. Deploy your app
5. Sync functions in Inngest dashboard

## Monitoring

### Inngest Dashboard (Local)
`http://localhost:8288`

### Inngest Dashboard (Production)
`https://app.inngest.com`

View:
- Function executions
- Step-by-step logs
- Retry attempts
- Error details

## Troubleshooting

**Functions not appearing?**
- Ensure Inngest dev server is running
- Restart Next.js app
- Visit `http://localhost:8288/dev` to sync

**Queries not executing?**
- Check Inngest dashboard for events
- View application logs for errors
- Verify database connection

## Full Documentation

See `docs/inngest-setup.md` for complete details.
