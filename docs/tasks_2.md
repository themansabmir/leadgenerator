# Phase 2 Tasks: Google API Credentials Management
## Lead Harvester MVP - Detailed Task Breakdown

**Prerequisites Completed:**
- Phase 0: Foundation Setup (DB models, encryption/auth/validation utils, auth middleware)
- Phase 1: Authentication System (login/logout, protected layouts, middleware)
- MongoDB connection and `Credential` model available (see Phase 0)

---

## Task 2.1: Credentials API Implementation
**Priority:** High  
**Estimated Time:** 2–3 hours  
**Context:** Securely manage Google Custom Search API credentials. Only store encrypted secrets. Return safe fields to clients. All routes protected.
**Tech Stack:** Next.js App Router (route handlers), TypeScript, Mongoose, Zod, crypto-based encryption

### Subtasks:

#### Task 2.1.1: Input Validation Schemas (Zod)
**Requirements:**
- `createCredentialSchema`: `{ label: string.min(2), apiKey: string.min(1), engineId: string.min(1) }`
- `credentialIdParamSchema`: `{ id: string.regex(ObjectId) }`
- Export derived TS types (`CreateCredentialInput`) for API and UI reuse

**Deliverables:**
- Typed validators colocated under `src/lib/validators/credential.validators.ts`

#### Task 2.1.2: Credential Service (Functional, Decoupled)
**Requirements:**
- Pure functions with explicit dependencies injected (repository + encryption)
- `createCredential(deps, input)` → encrypt key/engineId → persist → return safe DTO
- `listCredentials(deps)` → return `{ id, label, createdAt }[]`
- `deleteCredential(deps, id)` → hard-delete by id
- Return typed DTOs; never return decrypted secrets

**Deliverables:**
- `src/lib/services/credential/CredentialService.ts` with:
  - Types: `CredentialDTO`, `CreateCredentialInput`, `CredentialServiceDeps`
  - Functions: `createCredential`, `listCredentials`, `deleteCredential`

#### Task 2.1.3: Repository Layer
**Requirements:**
- Encapsulate Mongoose operations for testability and swap-ability
- `CredentialRepository` with methods: `insert`, `findAllSafe`, `deleteById`
- Map DB document → typed DTO in repo or service (choose one layer consistently)

**Deliverables:**
- `src/db/repositories/CredentialRepository.ts`

#### Task 2.1.4: Encryption Utility Integration
**Requirements:**
- Use AES-256-CBC (or Node crypto AES-256-GCM) with key from env (e.g., `ENCRYPTION_KEY`)
- Provide `encrypt(text): string` and `decrypt(text): string` (decrypt used only by services that need it; Phase 2 API does not expose decrypt)
- If not present yet, implement: `src/lib/utils/encryption.ts`

#### Task 2.1.5: Protected API Routes
**Requirements:**
- `GET /api/credentials` → list labels + ids + createdAt
- `POST /api/credentials` → validate with Zod → encrypt secrets → save → return created `{ id, label, createdAt }`
- `DELETE /api/credentials/[id]` → validate id → delete
- All routes use auth middleware/guard to ensure user is authenticated
- Consistent error responses with status codes and message

**Deliverables:**
- `src/app/api/credentials/route.ts` (GET, POST)
- `src/app/api/credentials/[id]/route.ts` (DELETE)
- Optionally create a small `httpError(status, message)` helper

**Acceptance Criteria:**
- Routes are protected and return 401 when unauthorized
- POST encrypts `apiKey` and `engineId` before persist
- GET returns only `{ id, label, createdAt }` (no secrets)
- DELETE removes the credential by id and is idempotent
- Proper typing across layers; validators applied at boundary
- Unit-level testability via dependency injection (service accepts repo/crypto deps)

---

## Task 2.2: Credentials Management UI
**Priority:** High  
**Estimated Time:** 3 hours  
**Context:** Provide a clean, typed, and responsive UI to manage credentials. Use the reusable shadcn/TanStack `DataTable` for listing. Apply react-query with cache keys and optimistic UX.
**Tech Stack:** Next.js App Router (client components), TypeScript, shadcn/ui, TanStack Table, React Query, React Hook Form, Zod

### Subtasks:

#### Task 2.2.1: API Client + React Query Hooks
**Requirements:**
- `useCredentialsQuery()` → GET list
- `useCreateCredentialMutation()` → POST
- `useDeleteCredentialMutation()` → DELETE
- Centralize fetchers in `src/lib/client/credentials.api.ts` (typed with Zod in/out)
- Query keys under `src/lib/client/queryKeys.ts` (e.g., `['credentials']`)

**Deliverables:**
- `src/lib/client/credentials.api.ts`
- `src/lib/client/queryKeys.ts`
- `src/hooks/useCredentials.ts` exporting the above hooks

#### Task 2.2.2: Table Columns + DataTable Integration
**Requirements:**
- Columns: Label, Created, Actions (Delete)
- Sorting by Label/Created, global search on Label
- Use existing `DataTable` and `DataTableColumnHeader`

**Deliverables:**
- `src/components/credentials/columns.tsx` (typed `ColumnDef<CredentialDTO>`) 
- `src/components/credentials/CredentialsTable.tsx` using `DataTable`

#### Task 2.2.3: Add Credential Modal (Form)
**Requirements:**
- Fields: Label, API Key (password), Engine ID (password)
- React Hook Form + Zod resolver (reuse `CreateCredentialInput`)
- Submit → call create mutation → close + invalidate list
- Show password-type fields; never display secrets after create

**Deliverables:**
- `src/components/credentials/AddCredentialModal.tsx`

#### Task 2.2.4: Page Composition
**Requirements:**
- Route: `/credentials` under dashboard layout
- Header with Page title + "Add New Credential" button
- Table below with loading/empty/error states
- Delete with confirmation (shadcn `AlertDialog`)

**Deliverables:**
- `src/app/(dashboard)/credentials/page.tsx`

**Acceptance Criteria:**
- Users can add a credential; table updates immediately (optimistic or refetch)
- Users can delete a credential with confirmation
- Table supports sort and search on Label, paginates client-side
- Fully typed components and hooks; Zod validates form and API boundaries
- UI remains responsive and accessible; consistent naming and folder structure

---

## Task 2.3: Quality & Testing
**Priority:** Medium  
**Estimated Time:** 1.5–2 hours  
**Context:** Ensure reliability, typing, and decoupling.

### Subtasks:
- Add unit tests for `CredentialService` with mock repo/crypto deps
- Happy/edge-path tests: duplicate labels, invalid payloads, missing auth
- MSW-based integration tests for hooks (optional)
- Type-level tests (tsd or compile-time checks) for DTOs and forms

**Deliverables:**
- Tests under `tests/unit/services/CredentialService.test.ts` (optional path per repo)

**Acceptance Criteria:**
- Service functions are pure (except dependency calls) and covered by tests
- Validators reject bad inputs; API handlers map Zod errors to 400
- Strict TypeScript passes without `any`; DTOs and forms share types

---

## Acceptance Criteria Summary

### Functional Requirements:
- ✅ Create/list/delete credentials via protected APIs
- ✅ Secrets are encrypted before persistence and never returned by APIs
- ✅ UI lists credentials with label/date and supports add/delete
- ✅ Sort/search and pagination on the credentials table

### Technical Requirements:
- ✅ Zod validators at API boundaries and UI forms
- ✅ Functional, decoupled service with dependency injection
- ✅ Repository layer isolates DB concerns
- ✅ Strong, shared types across API/UI
- ✅ Consistent error handling and status codes

### UI/UX Requirements:
- ✅ Clean shadcn/ui-based table and modal
- ✅ Accessible forms and dialogs
- ✅ Loading/empty/error states handled gracefully

### Security Requirements:
- ✅ AES-based encryption of secrets using env key
- ✅ Protected routes (401 on unauthenticated)
- ✅ Secrets never leaked to client

---

## Dependencies & Prerequisites
- `Credential` Mongoose model (Phase 0)
- Encryption utility configured with `ENCRYPTION_KEY`
- Auth middleware/guard for route protection

---

## File Structure After Completion

```
src/
├── app/
│   └── (dashboard)/
│       └── credentials/
│           └── page.tsx
├── components/
│   └── credentials/
│       ├── AddCredentialModal.tsx
│       ├── CredentialsTable.tsx
│       └── columns.tsx
├── db/
│   └── repositories/
│       └── CredentialRepository.ts
├── lib/
│   ├── client/
│   │   ├── credentials.api.ts
│   │   └── queryKeys.ts
│   ├── services/
│   │   └── credential/
│   │       └── CredentialService.ts
│   ├── utils/
│   │   └── encryption.ts
│   └── validators/
│       └── credential.validators.ts
└── app/
    └── api/
        └── credentials/
            ├── route.ts          # GET, POST
            └── [id]/
                └── route.ts      # DELETE
```

---

## Naming & Conventions (Folder Reference)
- Components: PascalCase files, colocated by feature in `src/components/credentials`
- Services/Validators/Client: feature-based folders under `src/lib`
- Repositories: `src/db/repositories` for decoupled data access
- API: Next.js App Router routes in `src/app/api/credentials`
- Types: export shared types from validators (`z.infer`) to avoid duplication
- Functions: small, pure, and composable with explicit deps passed as params

---

## Next Phase Preparation
- After Phase 2, proceed to Phase 3 (Google Dork Scraper): the selected `credentialId` will be used to decrypt and call Google Custom Search API inside server-side services only.
