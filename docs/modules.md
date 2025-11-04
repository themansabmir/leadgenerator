# Complete Task Breakdown - Scraper MVP

## Prerequisites
- Next.js 14 project initialized with TypeScript, Tailwind CSS, App Router
- All dependencies installed (see setup guide)
- `.env.local` configured with all environment variables

---

## PHASE 0: Foundation Setup

### Task 0.1: Database Connection & Models Setup
**Priority:** Critical - Do this first
**Estimated Time:** 2-3 hours

**Deliverables:**
1. Create `src/lib/db/mongodb.ts` with MongoDB connection logic using Mongoose
2. Create all Mongoose models in `src/lib/db/models/`:
   - `User.ts` - Single user with email, password (hashed), createdAt
   - `Credential.ts` - Google API credentials (encrypted apiKey, encrypted engineId, label, createdAt)
   - `Category.ts` - name, slug, createdAt
   - `Query.ts` - dork, categoryId (ref), location, status (pending/scraping/completed/failed), totalResults, lastPageScraped, createdAt
   - `Result.ts` - queryId (ref), url, title, snippet, pageNumber, position, extractionStatus (pending/processing/extracted/failed/no_data), scrapedAt
   - `CustomerInfo.ts` - resultId (ref), queryId (ref), categoryId (ref), location, url, emails (array), phones (array), primaryEmail, primaryPhone, emailsSentCount, lastEmailType, lastContactedAt, isLead, leadId (ref), extractedAt
   - `Lead.ts` - customerInfoId (ref), categoryId (ref), location, url, emails, phones, primaryEmail, primaryPhone, status (new/contacted/qualified/proposal_sent/won/lost), priority (low/medium/high), notes, emailsSent, lastEmailType, lastContactedAt, repliedAt, convertedAt, nextFollowUpDate, createdAt, updatedAt
   - `EmailTemplate.ts` - categoryId (ref, nullable), location (nullable), templateType (first_email/follow_up_1/follow_up_2/follow_up_3), subject, bodyTemplate, variables (array), createdAt, updatedAt
   - `Campaign.ts` - filters {categoryId, location}, emailType, totalEligible, sentCount, failedCount, processedCustomerIds (array), status (running/paused/completed/stopped), dailyLimit, startedAt, pausedAt, completedAt, stoppedAt
   - `EmailLog.ts` - campaignId (ref), customerInfoId (ref), recipientEmail, emailType, sentAt, status (sent/failed/bounced), error, attemptCount

**Acceptance Criteria:**
- All models defined with proper TypeScript interfaces
- Mongoose schemas with validation and indexes
- MongoDB connection utility with error handling
- Models exported and ready to use in API routes

**Files to Create:**
- `src/lib/db/mongodb.ts`
- `src/lib/db/models/User.ts`
- `src/lib/db/models/Credential.ts`
- `src/lib/db/models/Category.ts`
- `src/lib/db/models/Query.ts`
- `src/lib/db/models/Result.ts`
- `src/lib/db/models/CustomerInfo.ts`
- `src/lib/db/models/Lead.ts`
- `src/lib/db/models/EmailTemplate.ts`
- `src/lib/db/models/Campaign.ts`
- `src/lib/db/models/EmailLog.ts`
- `src/types/index.ts` (TypeScript interfaces for all models)

---

### Task 0.2: Utility Functions
**Priority:** Critical
**Estimated Time:** 1-2 hours

**Deliverables:**
1. `src/lib/utils/encryption.ts` - Encrypt/decrypt functions using crypto for API credentials (AES-256-CBC)
2. `src/lib/utils/auth.ts` - JWT sign/verify, password hash/compare using bcryptjs
3. `src/lib/utils/validation.ts` - Email validation, phone number extraction regex patterns
4. `src/lib/utils/helpers.ts` - Date formatting, sleep function, error handling utilities

**Acceptance Criteria:**
- Encryption is two-way (can decrypt)
- JWT functions work with proper expiry
- Password hashing is secure (bcrypt with salt rounds 10)
- Validation functions handle edge cases

**Files to Create:**
- `src/lib/utils/encryption.ts`
- `src/lib/utils/auth.ts`
- `src/lib/utils/validation.ts`
- `src/lib/utils/helpers.ts`

---

### Task 0.3: Authentication Middleware
**Priority:** Critical
**Estimated Time:** 1 hour

**Deliverables:**
1. Create `src/lib/middleware/authMiddleware.ts` - Verify JWT from cookies/headers, attach user to request

**Acceptance Criteria:**
- Middleware extracts JWT from Authorization header or cookies
- Validates JWT and returns user object or 401 error
- Can be reused across all protected API routes

**Files to Create:**
- `src/lib/middleware/authMiddleware.ts`

---

### Task 0.4: Seed Initial User
**Priority:** High
**Estimated Time:** 30 minutes

**Deliverables:**
1. Create script or API route to seed one admin user in database
2. Email: admin@example.com, Password: (your choice, hashed)

**Acceptance Criteria:**
- User can be created via script or one-time API call
- Password is properly hashed
- User exists in MongoDB

**Files to Create:**
- `src/scripts/seedUser.ts` or `/api/seed/user/route.ts`

---

## PHASE 1: Authentication System

### Task 1.1: Login API
**Priority:** Critical
**Estimated Time:** 2 hours

**Deliverables:**
1. `POST /api/auth/login` - Accept email/password, validate, return JWT token in httpOnly cookie + JSON response
2. `GET /api/auth/me` - Protected route that returns current user info (verify JWT)
3. `POST /api/auth/logout` - Clear JWT cookie

**Acceptance Criteria:**
- Login validates credentials against database
- Returns JWT token valid for 7 days
- Token stored in httpOnly cookie (secure in production)
- Invalid credentials return 401
- `/api/auth/me` returns user object or 401

**Files to Create:**
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/api/auth/logout/route.ts`

---

### Task 1.2: Login UI
**Priority:** Critical
**Estimated Time:** 2 hours

**Deliverables:**
1. Login page at `/login` with form (email, password, submit button)
2. Form handles submission, calls `/api/auth/login`
3. On success, redirects to `/dashboard`
4. On error, shows error message

**Acceptance Criteria:**
- Clean UI using Tailwind + shadcn/ui components
- Form validation (required fields)
- Loading state during submission
- Error handling with user-friendly messages
- Successful login redirects to dashboard

**Files to Create:**
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/layout.tsx` (minimal layout for auth pages)
- `src/components/auth/LoginForm.tsx`

---

### Task 1.3: Protected Layout & Auth Check
**Priority:** Critical
**Estimated Time:** 1 hour

**Deliverables:**
1. Dashboard layout at `src/app/(dashboard)/layout.tsx` with:
   - Sidebar navigation (Dashboard, Queries, Customers, Leads, Templates, Campaigns, Credentials)
   - Header with user info and logout button
   - Protected: redirects to /login if not authenticated
2. Client-side auth check using `/api/auth/me`

**Acceptance Criteria:**
- Layout renders only if user is authenticated
- Sidebar shows all navigation links
- Logout button clears token and redirects to login
- Responsive design

**Files to Create:**
- `src/app/(dashboard)/layout.tsx`
- `src/components/dashboard/Sidebar.tsx`
- `src/components/dashboard/Header.tsx`

---

## PHASE 2: Google API Credentials Management

### Task 2.1: Credentials API Routes
**Priority:** High
**Estimated Time:** 2 hours

**Deliverables:**
1. `GET /api/credentials` - List all credentials (return id, label only, not decrypted keys)
2. `POST /api/credentials` - Create new credential (encrypt apiKey & engineId before saving)
3. `DELETE /api/credentials/[id]` - Delete credential

**Acceptance Criteria:**
- All routes are protected (use auth middleware)
- API keys are encrypted before storing in DB
- List endpoint returns only safe data (labels, ids)
- Proper error handling

**Files to Create:**
- `src/app/api/credentials/route.ts` (GET, POST)
- `src/app/api/credentials/[id]/route.ts` (DELETE)

---

### Task 2.2: Credentials Management UI
**Priority:** High
**Estimated Time:** 2 hours

**Deliverables:**
1. `/credentials` page with:
   - Table showing all credentials (Label, Created Date, Actions)
   - "Add New Credential" button opens modal/form
   - Delete button with confirmation
2. Form to add credential: Label, API Key, Engine ID

**Acceptance Criteria:**
- Clean table UI with shadcn/ui components
- Add form validates required fields
- Delete has confirmation dialog
- Real-time updates after add/delete

**Files to Create:**
- `src/app/(dashboard)/credentials/page.tsx`
- `src/components/credentials/CredentialsTable.tsx`
- `src/components/credentials/AddCredentialModal.tsx`

---

## PHASE 3: Module 1 - Google Dork Scraper

### Task 3.1: Google Search Service
**Priority:** Critical
**Estimated Time:** 3 hours

**Deliverables:**
1. `src/lib/services/googleSearch.ts` with function:
   - `searchGoogleDork(dork, credentialId, startIndex)` 
   - Fetches credential from DB, decrypts
   - Calls Google Custom Search API
   - Returns { items: [], nextPageExists: boolean }
   - Handles errors (API limits, invalid credentials)

**Acceptance Criteria:**
- Properly constructs Google API URL with parameters
- Decrypts credentials securely
- Parses API response correctly
- Returns structured data (url, title, snippet)
- Detects if next page exists (checks queries.nextPage in response)

**Files to Create:**
- `src/lib/services/googleSearch.ts`

---

### Task 3.2: Scraper Service (Async Processing)
**Priority:** Critical
**Estimated Time:** 4 hours

**Deliverables:**
1. `src/lib/services/scraper.ts` with:
   - `startScrapeJob(queryId, dork, categoryId, location, credentialId)`
   - Async function that loops through pages:
     - Fetch page results from Google
     - Save each result to `Result` collection
     - Update `Query.totalResults` and `Query.lastPageScraped`
     - Continue until no next page
     - Update `Query.status` to 'completed' when done
   - Handles errors, updates status to 'failed' if crashes

**Acceptance Criteria:**
- Runs asynchronously (doesn't block API response)
- Saves results incrementally (user sees live count)
- Respects pagination (stops when Google says no more pages)
- Updates query status appropriately
- Error handling with logs

**Files to Create:**
- `src/lib/services/scraper.ts`

---

### Task 3.3: Scrape API Endpoint
**Priority:** Critical
**Estimated Time:** 2 hours

**Deliverables:**
1. `POST /api/scrape` - Protected endpoint
   - Accepts: { dork, categoryName, location, credentialId }
   - Creates Category if doesn't exist (find or create by name)
   - Creates Query record with status 'pending'
   - Triggers `startScrapeJob()` asynchronously
   - Returns queryId immediately
2. `GET /api/queries/[id]/status` - Returns query with current totalResults count

**Acceptance Criteria:**
- Endpoint returns quickly (doesn't wait for scrape to finish)
- Query is created with correct references
- Scraping starts in background
- Status endpoint returns live data

**Files to Create:**
- `src/app/api/scrape/route.ts`
- `src/app/api/queries/[id]/route.ts` (GET for status)

---

### Task 3.4: Scrape Form UI
**Priority:** High
**Estimated Time:** 2 hours

**Deliverables:**
1. Component: `ScrapeForm.tsx`
   - Inputs: Dork (textarea), Category Name, Location, Credential (dropdown)
   - Submit button
   - Fetches credentials list on mount
   - On submit, calls `/api/scrape`, shows success message
2. Place form on `/dashboard` page

**Acceptance Criteria:**
- Form validates all required fields
- Credential dropdown shows all available credentials
- Shows loading state during submission
- Success message with link to view query

**Files to Create:**
- `src/components/queries/ScrapeForm.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`

---

### Task 3.5: Queries Table with Live Updates
**Priority:** High
**Estimated Time:** 3 hours

**Deliverables:**
1. `/queries` page with table showing all queries:
   - Columns: Dork, Category, Location, Status, Total Results, Created Date, Actions
   - Status badge (color-coded: pending=yellow, scraping=blue, completed=green, failed=red)
   - Live count updates every 3 seconds using polling for 'scraping' status queries
   - Actions: View Details, Extract Contacts (if completed)

**Acceptance Criteria:**
- Table fetches queries from `/api/queries` (GET endpoint needed)
- Auto-refreshes counts for active scraping jobs
- Clean UI with status badges
- Clickable rows to view details

**Files to Create:**
- `src/app/(dashboard)/queries/page.tsx`
- `src/components/queries/QueriesTable.tsx`
- `src/components/queries/LiveProgressIndicator.tsx`
- `src/app/api/queries/route.ts` (GET - list all queries)

---

### Task 3.6: Query Details Page
**Priority:** Medium
**Estimated Time:** 2 hours

**Deliverables:**
1. `/queries/[id]` page showing:
   - Query details (dork, category, location, status, total results)
   - Table of all scraped URLs for this query
   - Pagination (10 per page)
   - "Extract Contacts" button (triggers Module 2)

**Acceptance Criteria:**
- Displays query metadata clearly
- Results table shows url, title, snippet, extraction status
- Pagination works
- Extract button visible only if status = 'completed'

**Files to Create:**
- `src/app/(dashboard)/queries/[id]/page.tsx`
- `src/app/api/queries/[id]/results/route.ts` (GET - paginated results)

---

## PHASE 4: Module 2 - Contact Extraction

### Task 4.1: Contact Extraction Service (Puppeteer + Regex)
**Priority:** Critical
**Estimated Time:** 4 hours

**Deliverables:**
1. `src/lib/services/contactExtractor.ts` with:
   - `extractContactsFromUrl(url)` using Puppeteer:
     - Launch headless browser
     - Navigate to URL (timeout 30s)
     - Get page HTML
     - Extract emails using regex: `/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g`
     - Extract phones using regex for common formats
     - Return { emails: [], phones: [] }
   - `processExtractionBatch(queryId, batchSize = 10)`:
     - Get next 10 unprocessed Results for queryId
     - For each result, call extractContactsFromUrl()
     - Create CustomerInfo records with extracted data
     - Update Result.extractionStatus to 'extracted' or 'no_data'
     - Add 2 second delay between each URL

**Acceptance Criteria:**
- Puppeteer configured with headless mode
- Regex patterns extract valid emails/phones
- Handles timeouts and errors gracefully
- Updates database after each URL processed
- Rate limiting (2s delay) to avoid blocks

**Files to Create:**
- `src/lib/services/contactExtractor.ts`

---

### Task 4.2: Extraction API Endpoint
**Priority:** Critical
**Estimated Time:** 2 hours

**Deliverables:**
1. `POST /api/queries/[id]/extract` - Protected endpoint
   - Triggers `processExtractionBatch(queryId)` asynchronously
   - Returns immediately with message "Extraction started"
2. `GET /api/queries/[id]/extraction-status` - Returns progress (extracted count / total)

**Acceptance Criteria:**
- Endpoint starts extraction in background
- Doesn't block response
- Status endpoint provides real-time progress

**Files to Create:**
- `src/app/api/queries/[id]/extract/route.ts`
- `src/app/api/queries/[id]/extraction-status/route.ts`

---

### Task 4.3: Extraction UI & Progress
**Priority:** High
**Estimated Time:** 2 hours

**Deliverables:**
1. Update Query Details page to show:
   - Extraction progress bar (e.g., "45/120 contacts extracted")
   - "Start Extraction" button (if not started)
   - Live progress updates every 5 seconds during extraction

**Acceptance Criteria:**
- Progress bar updates in real-time
- Start button disabled during extraction
- Shows completion message when done

**Files to Update:**
- `src/app/(dashboard)/queries/[id]/page.tsx`
- `src/components/queries/ExtractionProgress.tsx` (new component)

---

### Task 4.4: Customers List Page
**Priority:** High
**Estimated Time:** 3 hours

**Deliverables:**
1. `/customers` page with table of all CustomerInfo records:
   - Columns: URL, Email, Phone, Category, Location, Emails Sent Count, Last Contacted, Is Lead, Actions
   - Filters: Category, Location, Is Lead (checkboxes)
   - Search by URL or email
   - Actions: Convert to Lead (button)
   - Pagination

**Acceptance Criteria:**
- Table fetches from `/api/customers` (GET endpoint needed)
- Filters work correctly
- Search is functional
- Clean UI with proper data formatting

**Files to Create:**
- `src/app/(dashboard)/customers/page.tsx`
- `src/components/customers/CustomersTable.tsx`
- `src/app/api/customers/route.ts` (GET with filters/search/pagination)

---

## PHASE 5: Lead Management

### Task 5.1: Lead Conversion API
**Priority:** High
**Estimated Time:** 2 hours

**Deliverables:**
1. `POST /api/customers/[id]/convert-lead` - Protected endpoint
   - Accepts: { priority, status, notes, nextFollowUpDate }
   - Creates Lead record with customer data
   - Updates CustomerInfo: isLead=true, leadId=newLeadId
   - Returns new lead object

**Acceptance Criteria:**
- Creates lead with all required fields
- Links customer to lead correctly
- Validates input data

**Files to Create:**
- `src/app/api/customers/[id]/convert-lead/route.ts`

---

### Task 5.2: Convert to Lead UI
**Priority:** High
**Estimated Time:** 2 hours

**Deliverables:**
1. Modal component: `ConvertLeadModal.tsx`
   - Form fields: Priority (dropdown), Status (dropdown), Notes (textarea), Next Follow-up Date (date picker)
   - Submit calls API, shows success, refreshes table

**Acceptance Criteria:**
- Modal opens from customer table action button
- Form validates required fields
- Success closes modal and updates UI
- Error handling

**Files to Create:**
- `src/components/customers/ConvertLeadModal.tsx`

---

### Task 5.3: Leads List & Kanban View
**Priority:** High
**Estimated Time:** 4 hours

**Deliverables:**
1. `/leads` page with two views (tabs):
   - **Table View**: List of leads with columns (Business Name/URL, Email, Priority, Status, Last Contact, Next Follow-up, Actions)
   - **Kanban View**: Columns by status (New, Contacted, Qualified, Proposal Sent, Won, Lost) with draggable cards
2. Filters: Priority, Category, Location, Follow-up overdue
3. Click lead to go to detail page

**Acceptance Criteria:**
- Both views fetch from `/api/leads` (GET endpoint needed)
- Kanban cards are draggable (updates status via API)
- Filters work on both views
- Clean, professional UI

**Files to Create:**
- `src/app/(dashboard)/leads/page.tsx`
- `src/components/leads/LeadsKanban.tsx`
- `src/components/leads/LeadsTable.tsx`
- `src/components/leads/LeadCard.tsx`
- `src/app/api/leads/route.ts` (GET, PATCH for status updates)

---

### Task 5.4: Lead Detail Page
**Priority:** Medium
**Estimated Time:** 3 hours

**Deliverables:**
1. `/leads/[id]` page showing:
   - Lead header (name, priority, status, contact info)
   - Email history (list of all emails sent)
   - Notes section (rich text area, editable)
   - Action buttons: Update Status, Update Priority, Schedule Follow-up, Mark as Won/Lost
   - Quick actions: Send Email, Call (opens phone app)

**Acceptance Criteria:**
- All lead data displayed clearly
- Notes are editable and save on blur
- Action buttons update lead via API
- Email history shows type and date

**Files to Create:**
- `src/app/(dashboard)/leads/[id]/page.tsx`
- `src/components/leads/LeadDetailsPanel.tsx`
- `src/components/leads/LeadNotesEditor.tsx`
- `src/app/api/leads/[id]/route.ts` (GET, PATCH for updates)

---

## PHASE 6: Module 3 - Email Templates

### Task 6.1: Template Renderer Service
**Priority:** Critical
**Estimated Time:** 2 hours

**Deliverables:**
1. `src/lib/services/templateRenderer.ts` with:
   - `renderTemplate(template, customerData)` using Handlebars
   - Builds context object from customer data + config variables
   - Compiles template and returns HTML string
   - Handles missing variables gracefully (uses defaults)

**Acceptance Criteria:**
- Handlebars properly compiles templates
- Variable substitution works correctly
- Missing variables don't crash (use defaults)
- Returns valid HTML

**Files to Create:**
- `src/lib/services/templateRenderer.ts`

---

### Task 6.2: Email Templates API
**Priority:** High
**Estimated Time:** 2 hours

**Deliverables:**
1. `GET /api/templates` - List all templates (with filters: categoryId, location, templateType)
2. `POST /api/templates` - Create new template
3. `GET /api/templates/[id]` - Get single template
4. `PATCH /api/templates/[id]` - Update template
5. `DELETE /api/templates/[id]` - Delete template
6. `POST /api/templates/preview` - Render template with sample data (for preview)

**Acceptance Criteria:**
- All routes protected
- Template validation (required fields)
- Preview endpoint renders with mock data
- Proper error handling

**Files to Create:**
- `src/app/api/templates/route.ts` (GET, POST)
- `src/app/api/templates/[id]/route.ts` (GET, PATCH, DELETE)
- `src/app/api/templates/preview/route.ts` (POST)

---

### Task 6.3: Template Editor UI
**Priority:** High
**Estimated Time:** 4 hours

**Deliverables:**
1. `/templates` page - List all templates in table/cards
2. `/templates/new` and `/templates/[id]` - Template editor with:
   - Category selector (dropdown)
   - Location input (optional)
   - Template Type dropdown (first_email, follow_up_1, etc.)
   - Subject line input (supports {{variables}})
   - Body editor (rich text or HTML with variable picker)
   - Variable picker dropdown/panel (shows available variables)
   - Live preview section (updates as you type)
   - Save button
3. Preview uses sample data: { email: "test@example.com", businessType: "Cafe", location: "London" }

**Acceptance Criteria:**
- Editor is user-friendly
- Variable picker inserts {{variable}} at cursor
- Live preview works with debounce
- Form validates before save
- Success message after save

**Files to Create:**
- `src/app/(dashboard)/templates/page.tsx`
- `src/app/(dashboard)/templates/new/page.tsx`
- `src/app/(dashboard)/templates/[id]/page.tsx`
- `src/components/templates/TemplateEditor.tsx`
- `src/components/templates/VariablePicker.tsx`
- `src/components/templates/TemplatePreview.tsx`

---

## PHASE 7: Module 3 - Email Campaigns

### Task 7.1: Email Service (SMTP with Nodemailer)
**Priority:** Critical
**Estimated Time:** 2 hours

**Deliverables:**
1. `src/lib/services/emailService.ts` with:
   - `sendEmail(to, subject, html, isTest = false)` using Nodemailer
   - Configured with SMTP credentials from env
   - If isTest=true, sends to TEST_EMAIL from env (for preview)
   - Returns success/error status
   - Handles unsubscribe link insertion in HTML

**Acceptance Criteria:**
- SMTP transporter configured correctly
- Emails send successfully
- Test email function works
- Proper error handling (invalid email, SMTP errors)
- Unsubscribe link added to all emails

**Files to Create:**
- `src/lib/services/emailService.ts`

---

### Task 7.2: Campaign Processor Service
**Priority:** Critical
**Estimated Time:** 5 hours

**Deliverables:**
1. `src/lib/services/campaignProcessor.ts` with:
   - `processCampaign(campaignId)` - Main async loop:
     - Checks campaign status (stops if paused/stopped)
     - Fetches next eligible customer (not isLead, not processed in this campaign, matches filters)
     - Gets appropriate template (with fallback logic)
     - Renders template with customer data
     - Sends email via emailService
     - Creates EmailLog record
     - Updates CustomerInfo (emailsSentCount, lastContactedAt, lastEmailType)
     - Updates Campaign (sentCount, processedCustomerIds)
     - Adds 1 second delay between emails
     - Stops at dailyLimit or when no more customers
     - Updates campaign status to 'completed' when done
   - `checkDailyLimit()` - Checks total emails sent today across all campaigns
   - `getNextCustomer(campaignId, filters)` - Query logic to find next customer

**Acceptance Criteria:**
- Respects daily limit (500 emails, resets at midnight)
- Processes customers in order
- Skips customers with no template available
- Handles errors (email failures) without stopping entire campaign
- Updates all necessary records
- Can be paused/resumed/stopped mid-execution

**Files to Create:**
- `src/lib/services/campaignProcessor.ts`

---

### Task 7.3: Campaign API Endpoints
**Priority:** Critical
**Estimated Time:** 3 hours

**Deliverables:**
1. `POST /api/campaigns/start` - Protected
   - Accepts: { filters: {categoryId, location}, emailType, dailyLimit }
   - Creates Campaign record with status 'running'
   - Triggers `processCampaign(campaignId)` asynchronously
   - Returns campaignId
2. `GET /api/campaigns` - List all campaigns
3. `GET /api/campaigns/[id]` - Get campaign details with live progress
4. `POST /api/campaigns/[id]/pause` - Set status to 'paused'
5. `POST /api/campaigns/[id]/resume` - Set status back to 'running', restart processor
6. `POST /api/campaigns/[id]/stop` - Set status to 'stopped' (cannot resume)
7. `POST /api/campaigns/test-email` - Send test email to configured TEST_EMAIL

**Acceptance Criteria:**
- Start endpoint triggers async processing
- Pause/resume/stop update status correctly
- Campaign processor respects status changes
- Test email endpoint works with sample template

**Files to Create:**
- `src/app/api/campaigns/start/route.ts`
- `src/app/api/campaigns/route.ts` (GET)
- `src/app/api/campaigns/[id]/route.ts` (GET)
- `src/app/api/campaigns/[id]/pause/route.ts` (POST)
- `src/app/api/campaigns/[id]/resume/route.ts` (POST)
- `src/app/api/campaigns/[id]/stop/route.ts` (POST)
- `src/app/api/campaigns/test-email/route.ts` (POST)

---

### Task 7.4: Campaign Launch UI
**Priority:** High
**Estimated Time:** 3 hours

**Deliverables:**
1. `/campaigns/launch` page with form:
   - Category filter (dropdown: All or specific category)
   - Location filter (text input: All or specific location)
   - Email Type (dropdown: first_email, follow_up_1, follow_up_2, follow_up_3)
   - Daily Limit (number input, default 500)
   - Preview section showing:
     - Total eligible customers (fetched via API preview endpoint)
     - Already contacted count
     - Estimated emails to send
   - "Send Test Email" button (sends to configured test email)
   - "Start Campaign" button

**Acceptance Criteria:**
- Form fetches preview data when filters change
- Test email button works and shows success message
- Start button creates campaign and redirects to campaign dashboard
- Validation prevents starting with 0 eligible customers

**Files to Create:**
- `src/app/(dashboard)/campaigns/launch/page.tsx`
- `src/components/campaigns/CampaignLaunchForm.tsx`
- `src/app/api/campaigns/preview/route.ts` (POST - returns eligible count)

---

### Task 7.5: Campaign Dashboard (Live Monitoring)
**Priority:** High
**Estimated Time:** 4 hours

**Deliverables:**
1. `/campaigns/[id]` page - Real-time campaign monitor:
   - Header: Campaign name (category + location + email type), Status badge
   - Progress bar: sentCount / totalEligible
   - Stats cards: Sent, Failed, Remaining, Daily Limit Used
   - Sending rate estimate (emails per minute)
   - Control buttons: Pause/Resume, Stop
   - Recent activity log (last 20 emails sent/failed)
   - Auto-refresh every 3 seconds while status = 'running'

**Acceptance Criteria:**
- Live updates without page reload
- Progress bar animates smoothly
- Control buttons work (pause resumes at correct point)
- Activity log shows real-time email sends
- Stop button shows confirmation dialog

**Files to Create:**
- `src/app/(dashboard)/campaigns/[id]/page.tsx`
- `src/components/campaigns/CampaignDashboard.tsx`
- `src/components/campaigns/CampaignControls.tsx`
- `src/components/campaigns/ActivityLog.tsx`

---
Task 7.6: Campaigns List Page
Priority: Medium
Estimated Time: 2 hours
Deliverables:

/campaigns page - List of all campaigns:

Table columns: Campaign Name, Filters (category/location), Email Type, Status, Progress (sent/total), Started, Actions
Status filter: All, Running, Paused, Completed, Stopped
Click row to view campaign dashboard
"Launch New Campaign" button



Acceptance Criteria:

Table fetches all campaigns from API
Status badges color-coded
Progress shows as fraction and percentage
Filters work correctly
Launch button goes to /campaigns/launch

Files to Create:

src/app/(dashboard)/campaigns/page.tsx
src/components/campaigns/CampaignsTable.tsx


Task 7.7: Unsubscribe Handling
Priority: Medium
Estimated Time: 2 hours
Deliverables:

/unsubscribe public page (no auth required)

Accepts query param: ?email=customer@example.com
Shows confirmation message
Updates CustomerInfo to mark as unsubscribed


Add isUnsubscribed field to CustomerInfo model
Update campaign processor to skip unsubscribed customers
Unsubscribe link automatically added to all email templates (in emailService)

Acceptance Criteria:

Unsubscribe page works without login
Email parameter is validated
Customer is marked unsubscribed in DB
Unsubscribed customers never receive emails
Unsubscribe link format: {APP_URL}/unsubscribe?email={customerEmail}

Files to Create:

src/app/unsubscribe/page.tsx
src/app/api/unsubscribe/route.ts (POST)

Files to Update:

src/lib/db/models/CustomerInfo.ts (add isUnsubscribed field)
src/lib/services/emailService.ts (auto-add unsubscribe link)
src/lib/services/campaignProcessor.ts (filter out unsubscribed)


PHASE 8: Categories Management
Task 8.1: Categories API
Priority: Medium
Estimated Time: 1 hour
Deliverables:

GET /api/categories - List all categories (for dropdowns across app)
POST /api/categories - Create new category (manual, if needed)
Note: Categories are auto-created during scrape, but this API allows manual management

Acceptance Criteria:

GET returns all categories sorted alphabetically
POST creates with unique name validation
Protected routes

Files to Create:

src/app/api/categories/route.ts (GET, POST)


PHASE 9: Dashboard & Analytics (Optional Enhancement)
Task 9.1: Dashboard Overview Page
Priority: Low
Estimated Time: 3 hours
Deliverables:

/dashboard page with stats cards:

Total Queries
Total URLs Scraped
Total Contacts Extracted
Total Leads
Active Campaigns
Emails Sent Today


Recent activity feed (last 10 queries/campaigns/leads)
Charts (optional):

Emails sent over time (last 7 days)
Leads by status (pie chart)
Queries by category (bar chart)



Acceptance Criteria:

Stats are accurate and fetch from database
Clean, modern dashboard design
Responsive layout
Activity feed shows useful info

Files to Create:

src/app/(dashboard)/dashboard/page.tsx
src/components/dashboard/StatsCards.tsx
src/components/dashboard/RecentActivity.tsx
src/app/api/dashboard/stats/route.ts (GET)


PHASE 10: Testing & Refinement
Task 10.1: End-to-End Testing Flow
Priority: High
Estimated Time: 4 hours
Test Scenarios:

Auth Flow:

Login with correct credentials → success
Login with wrong credentials → error
Access protected route without auth → redirect to login
Logout → clears session


Scraping Flow:

Add Google API credential
Submit dork scrape with all fields
Verify query created in database
Watch live count increment in queries table
Verify results saved in database
Check query status changes to 'completed'


Extraction Flow:

Click "Extract Contacts" on completed query
Verify extraction starts
Check CustomerInfo records created
Verify emails/phones extracted correctly
Check extraction status updates


Lead Conversion:

Convert customer to lead
Verify lead appears in leads page
Update lead status via Kanban drag-drop
Edit lead notes
Verify customer marked as isLead=true


Email Campaign:

Create email template with variables
Preview template with test data
Launch campaign with filters
Send test email → verify received
Start campaign → watch live progress
Pause campaign → verify stops
Resume campaign → verify continues
Check emails sent in EmailLog
Verify unsubscribe link works


Daily Limit:

Run campaign until hits 500 limit
Verify stops automatically
Wait until next day (or manually reset in DB for testing)
Verify can send again



Deliverables:

Document all test results
Fix any bugs found
Ensure all flows work end-to-end


Task 10.2: Error Handling & Edge Cases
Priority: High
Estimated Time: 3 hours
Handle Edge Cases:

Google API:

API key invalid → show clear error
Daily quota exceeded → graceful failure
No results found → handle empty response


Extraction:

Website timeout → mark as failed, continue to next
Website blocks bot → handle 403/blocked
No contacts found → mark as 'no_data'


Email Campaign:

Invalid email address → log failure, continue
SMTP error → retry once, then log failure
Template not found → skip customer, log warning
Daily limit reached → pause campaign automatically


Database:

Connection lost → reconnect logic
Duplicate entries → handle unique constraints



Deliverables:

Add try-catch blocks in all critical services
User-friendly error messages in UI
Proper logging for debugging
Graceful degradation (don't crash entire app)


Task 10.3: UI/UX Polish
Priority: Medium
Estimated Time: 3 hours
Improvements:

Loading states on all buttons/forms
Skeleton loaders for tables while fetching
Toast notifications for success/error (use shadcn/ui toast)
Confirmation dialogs for destructive actions (delete, stop campaign)
Empty states (when no data exists yet)
Responsive design check (mobile/tablet)
Keyboard shortcuts (optional: Ctrl+K for search)
Dark mode support (optional, Tailwind makes this easy)

Deliverables:

Consistent loading indicators across app
Toast notifications implemented
Confirmation dialogs added
Empty states designed
Mobile-friendly layout

Files to Create/Update:

src/components/ui/toast.tsx (shadcn)
src/components/ui/loading-spinner.tsx
src/components/ui/empty-state.tsx
Update all pages with proper loading/empty states


PHASE 11: Production Preparation
Task 11.1: Environment Configuration
Priority: High
Estimated Time: 1 hour
Deliverables:

Create .env.example with all required variables (without sensitive values)
Update .gitignore to exclude .env.local
Document all environment variables in README
Add validation script to check all env vars are set

Files to Create:

.env.example
README.md (comprehensive setup guide)
src/scripts/checkEnv.ts (validates env vars)


Task 11.2: Database Indexes & Optimization
Priority: High
Estimated Time: 2 hours
Deliverables:

Add indexes to frequently queried fields:

Query: categoryId, status, createdAt
Result: queryId, extractionStatus
CustomerInfo: categoryId, location, isLead, isUnsubscribed, emailsSentCount
Lead: status, priority, categoryId
Campaign: status, createdAt
EmailLog: campaignId, customerInfoId, sentAt


Add compound indexes where needed:

CustomerInfo: {isLead: 1, isUnsubscribed: 1, emailsSentCount: 1}



Acceptance Criteria:

Indexes defined in Mongoose schemas
Query performance improved for large datasets

Files to Update:

All model files in src/lib/db/models/


Task 11.3: Security Hardening
Priority: Critical
Estimated Time: 2 hours
Deliverables:

Rate limiting on API routes (use express-rate-limit or Next.js middleware)
Input validation/sanitization (use Zod schemas)
CORS configuration (if needed for external access)
Secure cookie settings (httpOnly, secure, sameSite)
SQL injection prevention (Mongoose handles this, but validate inputs)
XSS prevention (sanitize user inputs in templates)

Acceptance Criteria:

Rate limits prevent abuse
All user inputs validated
Cookies are secure
No obvious security vulnerabilities

Files to Create:

src/lib/validation/schemas.ts (Zod schemas for all inputs)
src/middleware.ts (Next.js middleware for rate limiting)


Task 11.4: Deployment Preparation
Priority: High
Estimated Time: 2 hours
Deliverables:

Set up MongoDB Atlas (cloud database) or document local setup
Configure SMTP with production credentials
Set up production environment variables on hosting platform (Vercel/Railway/etc.)
Test deployment on staging environment
Set up basic monitoring/logging (optional: Sentry for error tracking)

Acceptance Criteria:

App deploys successfully to production
Database connections work
Emails send correctly
All features functional in production


PHASE 12: Documentation
Task 12.1: User Documentation
Priority: Medium
Estimated Time: 2 hours
Deliverables:

README.md with:

Project overview
Features list
Installation instructions
Environment variables guide
How to run locally
How to deploy


User guide (optional):

How to scrape with Google dorks
How to manage credentials
How to extract contacts
How to create email templates
How to run campaigns
How to manage leads



Files to Create/Update:

README.md
docs/USER_GUIDE.md (optional)


Task 12.2: Code Documentation
Priority: Low
Estimated Time: 1 hour
Deliverables:

Add JSDoc comments to key functions
Document complex logic in services
Add inline comments for tricky code sections

Acceptance Criteria:

Main services have function documentation
Complex algorithms explained
Future developers can understand code flow


Summary: Module Completion Order
Recommended Build Order:

✅ Phase 0: Foundation (DB models, utils, auth middleware)
✅ Phase 1: Authentication
✅ Phase 2: Credentials Management
✅ Phase 3: Module 1 - Google Scraper
✅ Phase 4: Module 2 - Contact Extraction
✅ Phase 5: Lead Management
✅ Phase 6: Email Templates
✅ Phase 7: Email Campaigns
✅ Phase 8: Categories
✅ Phase 9: Dashboard (optional)
✅ Phase 10: Testing & Refinement
✅ Phase 11: Production Prep
✅ Phase 12: Documentation


Estimated Timeline
Total Development Time: ~120-150 hours (3-4 weeks for 1 developer working full-time)
By Phase:

Phase 0: 4-6 hours
Phase 1: 5-6 hours
Phase 2: 4 hours
Phase 3: 16-18 hours
Phase 4: 11-13 hours
Phase 5: 11-13 hours
Phase 6: 8-10 hours
Phase 7: 19-22 hours
Phase 8: 1 hour
Phase 9: 3 hours (optional)
Phase 10: 10 hours
Phase 11: 7 hours
Phase 12: 3 hours


Key Technologies & Libraries Summary
Core Stack:

Next.js 14 (App Router)
TypeScript
Tailwind CSS
shadcn/ui

Backend:

MongoDB + Mongoose
JWT (jsonwebtoken)
bcryptjs
crypto (Node.js built-in for encryption)

Scraping & Extraction:

Google Custom Search API
Puppeteer (headless browser)
Regex patterns for email/phone extraction

Email:

Nodemailer (SMTP)
Handlebars (template rendering)

UI Components:

Radix UI (via shadcn/ui)
Lucide React (icons)
Recharts (optional, for dashboard charts)
date-fns (date formatting)


Important Notes for LLM Processing
When giving tasks to LLM:

Provide context: Always include relevant model schemas, types, and related files
Be specific: Request complete, production-ready code with error handling
Request TypeScript: All code should be properly typed
Ask for best practices: Request proper validation, error handling, loading states
One task at a time: Don't overwhelm with multiple phases at once
Review outputs: Check generated code for security issues, bugs, inefficiencies

Example prompt structure:
Task: [Task number and name]
Context: [Relevant models, APIs, requirements]
Requirements: [Specific acceptance criteria]
Tech stack: Next.js 14 App Router, TypeScript, Mongoose, etc.

Please provide:
1. Complete file(s) with all necessary imports
2. Proper TypeScript types
3. Error handling
4. Comments for complex logic
5. Follow Next.js 14 App Router conventions

Files to create: [List files]