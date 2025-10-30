# LeadHarvester - Technology Stack

## Overview
This document outlines the complete technology stack used in the LeadHarvester application.

---

## Frontend Stack

### Core Framework
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with latest features
- **TypeScript** - Type-safe JavaScript

### UI & Styling
- **shadcn/ui** - Modern component library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Radix UI** - Headless UI primitives
- **next-themes** - Dark/light theme support

### State Management & Forms
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **TanStack Table** - Data table management
- **TanStack Query** - Server state management

### Data Visualization
- **Recharts** - Chart library for React
- **D3.js** - Advanced data visualization
- **React Flow** - Node-based UI for query builder

---

## Backend Stack

### Runtime & API
- **Node.js** - JavaScript runtime
- **Next.js API Routes** - Backend API endpoints
- **Prisma** - Database ORM
- **SQLite** - Development database
- **PostgreSQL** - Production database

### Web Scraping & Processing
- **Puppeteer** - Headless browser automation
- **Cheerio** - Server-side HTML parsing
- **Axios** - HTTP client
- **p-limit** - Concurrency control
- **robots-txt-parser** - Robots.txt compliance

### Authentication & Security
- **NextAuth.js** - Authentication system
- **bcryptjs** - Password hashing
- **jose** - JWT handling
- **helmet** - Security headers

---

## Data Processing & Validation

### Contact Extraction
- **libphonenumber-js** - Phone number parsing
- **email-validator** - Email validation
- **validator** - General data validation
- **cheerio** - HTML parsing

### Export & File Processing
- **xlsx** - Excel file generation
- **papaparse** - CSV processing
- **jspdf** - PDF generation
- **archiver** - File compression

---

## Development Tools

### Code Quality
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Staged file linting

### Testing
- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing
- **MSW** - API mocking

### Build & Deployment
- **Vercel** - Deployment platform
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline

---

## External APIs & Services

### Search & Data
- **Google Custom Search API** - Web search functionality
- **Hunter.io API** - Email verification (optional)
- **Clearbit API** - Company data enrichment (optional)

### Monitoring & Analytics
- **Vercel Analytics** - Web analytics
- **Sentry** - Error tracking
- **LogRocket** - Session recording

---

## Database Schema

### Core Tables
- **users** - User management
- **queries** - Search queries and templates
- **extractions** - Extraction jobs and status
- **contacts** - Extracted contact information
- **categories** - Contact categorization
- **settings** - User and system settings

---

## File Structure

```
leadharvester/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions and configs
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   └── styles/              # Global styles
├── prisma/                  # Database schema and migrations
├── public/                  # Static assets
├── docs/                    # Project documentation
└── tests/                   # Test files
```

---

## Performance Considerations

### Frontend Optimization
- Code splitting with Next.js dynamic imports
- Image optimization with Next.js Image component
- Bundle analysis and optimization
- Progressive Web App (PWA) features

### Backend Optimization
- Database query optimization with Prisma
- Caching strategies (Redis for production)
- Rate limiting and request throttling
- Background job processing

---

## Security Measures

### Data Protection
- Input validation and sanitization
- SQL injection prevention with Prisma
- XSS protection with proper escaping
- CSRF protection with NextAuth.js

### API Security
- Rate limiting on API endpoints
- API key management and rotation
- Secure headers with Helmet
- Environment variable protection

---

## Scalability Plan

### Horizontal Scaling
- Stateless application design
- Database connection pooling
- Load balancing ready architecture
- Microservices migration path

### Performance Monitoring
- Application performance monitoring
- Database query monitoring
- Error tracking and alerting
- User experience monitoring

---

## Development Workflow

### Version Control
- Git with conventional commits
- Feature branch workflow
- Pull request reviews
- Automated testing on PRs

### Code Quality
- TypeScript strict mode
- ESLint and Prettier configuration
- Pre-commit hooks with Husky
- Automated dependency updates

---

## Deployment Strategy

### Environments
- **Development** - Local development with SQLite
- **Staging** - Vercel preview deployments
- **Production** - Vercel production with PostgreSQL

### CI/CD Pipeline
- Automated testing on push
- Build verification
- Deployment automation
- Rollback capabilities
