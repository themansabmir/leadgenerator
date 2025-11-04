# Project Context

Brief map of the codebase to help humans and LLMs quickly locate code.

## Overview
- **Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **DB**: MongoDB via `mongodb` and `mongoose`
- **Key libs**: `@tanstack/react-query`, `@tanstack/react-table`, `zod`, `react-hook-form`, `lucide-react`

## Path Aliases
- `@/*` → `src/*` (tsconfig.json)
- shadcn aliases (components.json):
  - `@/components` → `src/components`
  - `@/lib/utils` → `src/lib/utils.ts`
  - `@/components/ui` → `src/components/ui`
  - `@/lib` → `src/lib`
  - `@/hooks` → `src/hooks`

## Root Structure
- `src/` — application code
- `public/` — static assets
- `docs/` — documentation, architecture, context
- `next.config.ts` — Next.js config
- `postcss.config.mjs` — Tailwind v4 via `@tailwindcss/postcss`
- `components.json` — shadcn/ui config
- `.env`, `env.example` — environment variables

## src Structure
- `src/app/` — Next.js App Router
  - `(auth)/` — auth routes/layouts
  - `(dashboard)/dashboard/page.tsx` — dashboard page
  - `api/` — server route handlers
  - `layout.tsx` — root layout
  - `page.tsx` — landing/home page
  - `globals.css` — Tailwind v4 entry + design tokens
- `src/components/`
  - `auth/` — auth-related UI
  - `dashboard/` — dashboard UI widgets
  - `ui/` — shadcn/ui primitives (button, input, table, etc.)
  - `data-table/` — reusable TanStack Table wrappers
    - `data-table.tsx` — generic table component (sorting/filter/pagination)
    - `data-table-column-header.tsx` — sortable header UI
    - `data-table-pagination.tsx` — pagination controls
    - `index.ts` — barrel exports
- `src/lib/`
  - `auth/`, `campaign/`, `email/`, `scraping/`, `template/` — domain libs (some may be empty/placeholders)
  - `utils.ts` — `cn` helper and misc utils
- `src/db/`
  - `mongodb.ts` — Mongo client/connection
  - `models/` — Mongoose models
- `src/hooks/`
  - `useAuth.ts` — auth hook
- `src/contexts/`
  - `AuthContext.tsx` — auth context/provider
- `src/config/`
  - `index.ts` — config constants/helpers
- `src/types/`
  - `auth.ts`, `google.types.ts`, `index.ts`, `query.ts`
- `src/scripts/`
  - `seedUser.ts` — seeding script
- `src/middleware.ts` — Next middleware

## Common Imports (examples)
- UI primitives: `import { Button } from "@/components/ui/button"`
- Data table: `import { DataTable, DataTableColumnHeader } from "@/components/data-table"`
- Utils: `import { cn } from "@/lib/utils"`
- Hooks: `import { useAuth } from "@/hooks/useAuth"`
- Models/DB: `import { SomeModel } from "@/db/models/Some"`

## LLM Search Tips
- Prefer alias paths (e.g., `@/components/ui/button`) to disambiguate files.
- For routes, search under `src/app` using segment names (e.g., `(dashboard)/dashboard/page.tsx`).
- For server logic, look in `src/app/api/**/route.ts` and `src/db/**`.
- For UI building blocks, search `src/components/ui/*` and `src/components/data-table/*`.
- For domain logic, search `src/lib/**` and `src/types/**` with the entity name.
- Mention exact component/function names and accessors for best results (e.g., `DataTable`, `useAuth`, `AuthContext`).
