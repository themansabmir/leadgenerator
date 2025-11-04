leadharvester/
├── .env.local                          # Environment variables (gitignored)
├── .env.example                        # Example env vars for setup
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── README.md
│
├── public/                             # Static assets
│   ├── images/
│   └── icons/
│
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── (public)/                   # Public routes (no auth)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── unsubscribe/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/                # Protected dashboard routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── queries/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── contacts/
│   │   │   │           └── page.tsx
│   │   │   ├── customers/
│   │   │   │   └── page.tsx
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── templates/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── campaigns/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── launch/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── credentials/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx              # Protected layout with sidebar
│   │   │
│   │   ├── api/                        # API Routes (Backend)
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── logout/
│   │   │   │   │   └── route.ts
│   │   │   │   └── me/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── credentials/
│   │   │   │   ├── route.ts            # GET (list), POST (create)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts        # DELETE
│   │   │   │
│   │   │   ├── categories/
│   │   │   │   └── route.ts            # GET (list), POST (create)
│   │   │   │
│   │   │   ├── scrape/
│   │   │   │   └── route.ts            # POST (start scrape job)
│   │   │   │
│   │   │   ├── queries/
│   │   │   │   ├── route.ts            # GET (list all)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts        # GET (single query)
│   │   │   │       ├── results/
│   │   │   │       │   └── route.ts    # GET (paginated results)
│   │   │   │       ├── extract/
│   │   │   │       │   └── route.ts    # POST (start extraction)
│   │   │   │       └── extraction-status/
│   │   │   │           └── route.ts    # GET (progress)
│   │   │   │
│   │   │   ├── customers/
│   │   │   │   ├── route.ts            # GET (list with filters)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts        # GET, PATCH
│   │   │   │       └── convert-lead/
│   │   │   │           └── route.ts    # POST
│   │   │   │
│   │   │   ├── leads/
│   │   │   │   ├── route.ts            # GET (list), POST
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts        # GET, PATCH, DELETE
│   │   │   │
│   │   │   ├── templates/
│   │   │   │   ├── route.ts            # GET (list), POST
│   │   │   │   ├── preview/
│   │   │   │   │   └── route.ts        # POST (render preview)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts        # GET, PATCH, DELETE
│   │   │   │
│   │   │   ├── campaigns/
│   │   │   │   ├── route.ts            # GET (list)
│   │   │   │   ├── start/
│   │   │   │   │   └── route.ts        # POST (start campaign)
│   │   │   │   ├── preview/
│   │   │   │   │   └── route.ts        # POST (preview eligible count)
│   │   │   │   ├── test-email/
│   │   │   │   │   └── route.ts        # POST (send test)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts        # GET (campaign details)
│   │   │   │       ├── pause/
│   │   │   │       │   └── route.ts    # POST
│   │   │   │       ├── resume/
│   │   │   │       │   └── route.ts    # POST
│   │   │   │       └── stop/
│   │   │   │           └── route.ts    # POST
│   │   │   │
│   │   │   ├── unsubscribe/
│   │   │   │   └── route.ts            # POST (public, no auth)
│   │   │   │
│   │   │   └── dashboard/
│   │   │       └── stats/
│   │   │           └── route.ts        # GET (dashboard statistics)
│   │   │
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Landing page (redirect to dashboard)
│   │   ├── globals.css                 # Global styles
│   │   └── error.tsx                   # Global error boundary
│   │
│   ├── components/                     # React Components (Organized by Feature)
│   │   ├── ui/                         # shadcn/ui Base Components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── label.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── loading-spinner.tsx
│   │   │   ├── empty-state.tsx
│   │   │   └── progress.tsx
│   │   │
│   │   ├── common/                     # Shared/Reusable Components
│   │   │   ├── PageHeader.tsx
│   │   │   ├── DataTable.tsx           # Generic table component
│   │   │   ├── SearchInput.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── Pagination.tsx
│   │   │
│   │   ├── layout/                     # Layout Components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileNav.tsx
│   │   │
│   │   ├── auth/                       # Authentication Components
│   │   │   ├── LoginForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── credentials/                # Credentials Management
│   │   │   ├── CredentialsTable.tsx
│   │   │   ├── AddCredentialModal.tsx
│   │   │   └── CredentialCard.tsx
│   │   │
│   │   ├── queries/                    # Google Scraping Module
│   │   │   ├── ScrapeForm.tsx
│   │   │   ├── QueriesTable.tsx
│   │   │   ├── QueryDetails.tsx
│   │   │   ├── LiveProgressIndicator.tsx
│   │   │   └── ResultsTable.tsx
│   │   │
│   │   ├── customers/                  # Customer Management
│   │   │   ├── CustomersTable.tsx
│   │   │   ├── CustomerFilters.tsx
│   │   │   ├── ConvertLeadModal.tsx
│   │   │   └── CustomerCard.tsx
│   │   │
│   │   ├── leads/                      # Lead Management
│   │   │   ├── LeadsTable.tsx
│   │   │   ├── LeadsKanban.tsx
│   │   │   ├── LeadCard.tsx
│   │   │   ├── LeadDetailsPanel.tsx
│   │   │   ├── LeadNotesEditor.tsx
│   │   │   ├── LeadStatusDropdown.tsx
│   │   │   └── LeadFilters.tsx
│   │   │
│   │   ├── templates/                  # Email Templates
│   │   │   ├── TemplateEditor.tsx
│   │   │   ├── TemplateList.tsx
│   │   │   ├── TemplatePreview.tsx
│   │   │   ├── VariablePicker.tsx
│   │   │   └── TemplateForm.tsx
│   │   │
│   │   ├── campaigns/                  # Email Campaigns
│   │   │   ├── CampaignLaunchForm.tsx
│   │   │   ├── CampaignsTable.tsx
│   │   │   ├── CampaignDashboard.tsx
│   │   │   ├── CampaignControls.tsx
│   │   │   ├── ActivityLog.tsx
│   │   │   ├── CampaignStats.tsx
│   │   │   └── EmailPreview.tsx
│   │   │
│   │   └── dashboard/                  # Dashboard Components
│   │       ├── StatsCards.tsx
│   │       ├── RecentActivity.tsx
│   │       ├── EmailsChart.tsx
│   │       └── LeadsChart.tsx
│   │
│   ├── lib/                            # Core Business Logic & Utilities
│   │   ├── db/                         # Database Layer
│   │   │   ├── mongodb.ts              # MongoDB connection
│   │   │   ├── models/                 # Mongoose Models
│   │   │   │   ├── User.ts
│   │   │   │   ├── Credential.ts
│   │   │   │   ├── Category.ts
│   │   │   │   ├── Query.ts
│   │   │   │   ├── Result.ts
│   │   │   │   ├── CustomerInfo.ts
│   │   │   │   ├── Lead.ts
│   │   │   │   ├── EmailTemplate.ts
│   │   │   │   ├── Campaign.ts
│   │   │   │   ├── EmailLog.ts
│   │   │   │   └── index.ts            # Export all models
│   │   │   └── repositories/           # Data Access Layer (Optional for complex queries)
│   │   │       ├── QueryRepository.ts
│   │   │       ├── CustomerRepository.ts
│   │   │       └── CampaignRepository.ts
│   │   │
│   │   ├── services/                   # Business Logic Services (CORE)
│   │   │   ├── auth/
│   │   │   │   ├── AuthService.ts      # Login, JWT generation
│   │   │   │   └── PasswordService.ts  # Hash, compare
│   │   │   │
│   │   │   ├── scraping/
│   │   │   │   ├── GoogleSearchService.ts      # Google API calls
│   │   │   │   ├── ScraperService.ts           # Orchestrates scraping jobs
│   │   │   │   └── ContactExtractionService.ts # Puppeteer + regex
│   │   │   │
│   │   │   ├── email/
│   │   │   │   ├── EmailService.ts             # SMTP sending via Nodemailer
│   │   │   │   ├── TemplateService.ts          # CRUD for templates
│   │   │   │   ├── TemplateRendererService.ts  # Handlebars rendering
│   │   │   │   └── CampaignService.ts          # Campaign orchestration
│   │   │   │
│   │   │   ├── lead/
│   │   │   │   └── LeadService.ts              # Lead conversion & management
│   │   │   │
│   │   │   └── credential/
│   │   │       └── CredentialService.ts        # Encrypt/decrypt API keys
│   │   │
│   │   ├── workers/                    # Background Jobs (Async Processing)
│   │   │   ├── ScraperWorker.ts        # Handles async scraping
│   │   │   ├── ExtractionWorker.ts     # Handles async contact extraction
│   │   │   └── CampaignWorker.ts       # Processes email campaigns
│   │   │
│   │   ├── utils/                      # Pure Utility Functions
│   │   │   ├── encryption.ts           # Encrypt/decrypt (crypto)
│   │   │   ├── jwt.ts                  # JWT sign/verify
│   │   │   ├── password.ts             # bcrypt hash/compare
│   │   │   ├── validation.ts           # Email/phone regex validators
│   │   │   ├── date.ts                 # Date formatting helpers
│   │   │   ├── string.ts               # String manipulation
│   │   │   ├── error.ts                # Error handling utilities
│   │   │   └── helpers.ts              # Misc helpers (sleep, retry, etc.)
│   │   │
│   │   ├── middleware/                 # Next.js Middleware & Custom Middleware
│   │   │   ├── auth.ts                 # JWT verification middleware
│   │   │   ├── errorHandler.ts         # Centralized error handling
│   │   │   └── rateLimit.ts            # Rate limiting
│   │   │
│   │   ├── validators/                 # Input Validation Schemas (Zod)
│   │   │   ├── auth.validators.ts
│   │   │   ├── query.validators.ts
│   │   │   ├── customer.validators.ts
│   │   │   ├── lead.validators.ts
│   │   │   ├── template.validators.ts
│   │   │   └── campaign.validators.ts
│   │   │
│   │   ├── constants/                  # Application Constants
│   │   │   ├── status.ts               # Status enums
│   │   │   ├── routes.ts               # Route paths
│   │   │   └── config.ts               # App config
│   │   │
│   │   └── hooks/                      # Custom React Hooks
│   │       ├── useAuth.ts              # Auth state management
│   │       ├── useQuery.ts             # Query management
│   │       ├── usePolling.ts           # Auto-refresh polling
│   │       ├── useDebounce.ts          # Debouncing
│   │       └── useToast.ts             # Toast notifications
│   │
│   ├── types/                          # TypeScript Type Definitions
│   │   ├── index.ts                    # Main types export
│   │   ├── models.ts                   # Database model types
│   │   ├── api.ts                      # API request/response types
│   │   ├── components.ts               # Component prop types
│   │   └── enums.ts                    # Enums
│   │
│   ├── config/                         # Configuration Files
│   │   ├── env.ts                      # Env variable validation
│   │   ├── database.ts                 # DB config
│   │   └── email.ts                    # Email config
│   │
│   └── scripts/                        # Utility Scripts
│       ├── seedUser.ts                 # Seed initial admin user
│       ├── checkEnv.ts                 # Validate environment variables
│       └── migrateDb.ts                # Database migrations (if needed)
│
├── tests/                              # Testing (Optional but Recommended)
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   └── api/
│   └── e2e/
│
└── docs/                               # Documentation
    ├── API.md                          # API documentation
    ├── ARCHITECTURE.md                 # System architecture
    ├── DEPLOYMENT.md                   # Deployment guide
    └── USER_GUIDE.md                   # User manual
```