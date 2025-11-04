# Phase 1 Tasks: Authentication System
## Lead Harvester MVP - Module 1 Detailed Task Breakdown

**Prerequisites Completed:**
- Phase 0: Foundation Setup (Database models, utilities, auth middleware)
- Next.js 14 project with TypeScript, Tailwind CSS, App Router
- MongoDB connection and all models created
- Utility functions for encryption, auth, validation
- Authentication middleware implemented

---

## Task 1.1: Login API Implementation
**Priority:** Critical  
**Estimated Time:** 2 hours  
**Context:** Core authentication system using JWT tokens and bcrypt password hashing  
**Requirements:** Secure login with httpOnly cookies, proper error handling, and token validation  
**Tech Stack:** Next.js 14 App Router, TypeScript, Mongoose, JWT, bcryptjs

### Subtasks:

#### Task 1.1.1: POST /api/auth/login Route
**Context:** User model with hashed passwords, JWT utilities from Phase 0  
**Requirements:**
- Accept email/password in request body
- Validate credentials against User model in MongoDB
- Hash comparison using bcryptjs
- Generate JWT token with 7-day expiry
- Set httpOnly cookie with secure flags
- Return user data (exclude password) + success message
- Handle invalid credentials with 401 status
- Input validation for email format and required fields

**Deliverables:**
- Complete API route with TypeScript interfaces
- Proper error handling and status codes
- Security best practices (httpOnly cookies)
- Input validation and sanitization

#### Task 1.1.2: GET /api/auth/me Route  
**Context:** Auth middleware for JWT verification, User model  
**Requirements:**
- Protected route using auth middleware
- Extract JWT from Authorization header or cookies
- Verify token validity and expiration
- Return current user object (exclude password)
- Return 401 if token invalid/expired
- Handle missing token gracefully

**Deliverables:**
- Protected API route implementation
- JWT verification logic
- User data serialization
- Error handling for invalid/expired tokens

#### Task 1.1.3: POST /api/auth/logout Route
**Context:** JWT token management, cookie handling  
**Requirements:**
- Clear JWT cookie from client
- Set cookie expiration to past date
- Return success confirmation
- Handle cases where no token exists
- Secure cookie clearing

**Deliverables:**
- Logout endpoint implementation
- Cookie clearing mechanism
- Success response handling

**Files to Create:**
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/me/route.ts`  
- `src/app/api/auth/logout/route.ts`
- `src/types/auth.ts` (TypeScript interfaces for auth responses)

---

## Task 1.2: Login UI Implementation
**Priority:** Critical  
**Estimated Time:** 2 hours  
**Context:** shadcn/ui components, Tailwind CSS, React Hook Form for validation  
**Requirements:** Clean, responsive login form with validation and error handling  
**Tech Stack:** Next.js 14 App Router, TypeScript, shadcn/ui, Tailwind CSS, React Hook Form

### Subtasks:

#### Task 1.2.1: Auth Layout Component
**Context:** Minimal layout for authentication pages, responsive design  
**Requirements:**
- Clean, centered layout for auth pages
- Responsive design (mobile-first)
- Consistent styling with app theme
- Logo/branding placement
- Background styling

**Deliverables:**
- Auth layout component with TypeScript
- Responsive CSS using Tailwind
- Consistent branding elements

#### Task 1.2.2: Login Form Component
**Context:** shadcn/ui form components, React Hook Form validation  
**Requirements:**
- Email input with validation (required, email format)
- Password input with visibility toggle
- Submit button with loading state
- Form validation with error messages
- Accessibility features (labels, ARIA attributes)
- Keyboard navigation support

**Deliverables:**
- Reusable LoginForm component
- Form validation logic
- Loading states and error handling
- Accessibility compliance

#### Task 1.2.3: Login Page Implementation
**Context:** Next.js App Router, client-side navigation  
**Requirements:**
- Login page at `/login` route
- Form submission handling
- API integration with `/api/auth/login`
- Success redirect to `/dashboard`
- Error message display
- Remember me functionality (optional)

**Deliverables:**
- Complete login page component
- API integration logic
- Navigation and redirect handling
- Error state management

**Files to Create:**
- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/components/auth/LoginForm.tsx`
- `src/components/ui/form.tsx` (shadcn/ui form components if not exists)

---

## Task 1.3: Protected Layout & Auth Check
**Priority:** Critical  
**Estimated Time:** 1 hour  
**Context:** Dashboard layout with navigation, auth state management  
**Requirements:** Protected dashboard layout with sidebar navigation and auth verification  
**Tech Stack:** Next.js 14 App Router, TypeScript, shadcn/ui, React Context/hooks

### Subtasks:

#### Task 1.3.1: Auth Context Provider
**Context:** React Context for global auth state, JWT token management  
**Requirements:**
- Auth context for user state management
- Login/logout functions
- Token refresh logic
- Loading states during auth checks
- Persistent auth state across page reloads

**Deliverables:**
- AuthContext provider component
- Custom useAuth hook
- Token management utilities
- Auth state persistence

#### Task 1.3.2: Dashboard Sidebar Navigation
**Context:** Navigation structure for all app modules, responsive design  
**Requirements:**
- Sidebar with navigation links:
  - Dashboard (overview)
  - Queries (scraping management)
  - Customers (contact database)
  - Leads (lead management)
  - Templates (email templates)
  - Campaigns (email campaigns)
  - Credentials (Google API keys)
- Active route highlighting
- Responsive collapse/expand
- Icons for each navigation item
- Proper accessibility

**Deliverables:**
- Sidebar component with navigation
- Route highlighting logic
- Responsive behavior
- Icon integration (Lucide React)

#### Task 1.3.3: Dashboard Header Component
**Context:** User session management, logout functionality  
**Requirements:**
- Header with user information display
- User avatar/initials
- Logout button with confirmation
- Responsive design
- User menu dropdown (optional)

**Deliverables:**
- Header component with user info
- Logout functionality
- Responsive design
- User menu implementation

#### Task 1.3.4: Protected Dashboard Layout
**Context:** Next.js App Router layout system, auth verification  
**Requirements:**
- Layout component for dashboard routes
- Auth check on layout mount
- Redirect to `/login` if not authenticated
- Loading state during auth verification
- Sidebar and header integration
- Main content area styling

**Deliverables:**
- Dashboard layout component
- Auth protection logic
- Layout composition (sidebar + header + content)
- Loading and error states

**Files to Create:**
- `src/app/(dashboard)/layout.tsx`
- `src/components/dashboard/Sidebar.tsx`
- `src/components/dashboard/Header.tsx`
- `src/contexts/AuthContext.tsx`
- `src/hooks/useAuth.ts`
- `src/components/dashboard/UserMenu.tsx`

---

## Task 1.4: Auth State Management & Route Protection
**Priority:** High  
**Estimated Time:** 1.5 hours  
**Context:** Client-side route protection, auth state persistence  
**Requirements:** Comprehensive auth state management with route protection  
**Tech Stack:** Next.js 14 App Router, TypeScript, React Context, localStorage

### Subtasks:

#### Task 1.4.1: Route Protection Middleware
**Context:** Next.js middleware, JWT verification  
**Requirements:**
- Middleware to protect dashboard routes
- JWT token validation
- Automatic redirect to login for unauthenticated users
- Public route exceptions (login, register, etc.)
- Token refresh handling

**Deliverables:**
- Next.js middleware implementation
- Route protection logic
- Token validation utilities

#### Task 1.4.2: Auth State Persistence
**Context:** Browser storage, token management  
**Requirements:**
- Persist auth state across browser sessions
- Secure token storage (httpOnly cookies preferred)
- Auto-login on app load if valid token exists
- Token expiration handling
- Logout on token expiry

**Deliverables:**
- Token persistence logic
- Auto-login functionality
- Expiration handling

#### Task 1.4.3: Loading States & Error Handling
**Context:** User experience during auth operations  
**Requirements:**
- Loading spinners during auth checks
- Error messages for auth failures
- Retry mechanisms for network errors
- Graceful degradation for auth failures

**Deliverables:**
- Loading components
- Error handling utilities
- User feedback mechanisms

**Files to Create:**
- `src/middleware.ts` (Next.js middleware)
- `src/lib/auth/tokenManager.ts`
- `src/components/ui/loading-spinner.tsx`
- `src/components/auth/AuthGuard.tsx`

---

## Task 1.5: Dashboard Landing Page
**Priority:** Medium  
**Estimated Time:** 1 hour  
**Context:** Initial dashboard page with basic navigation  
**Requirements:** Simple dashboard page to verify auth system works  
**Tech Stack:** Next.js 14 App Router, TypeScript, shadcn/ui

### Subtasks:

#### Task 1.5.1: Dashboard Overview Page
**Context:** Protected dashboard route, user welcome experience  
**Requirements:**
- Welcome message with user name
- Quick navigation cards to main features
- Basic stats placeholders (for future phases)
- Clean, modern design
- Call-to-action buttons for next steps

**Deliverables:**
- Dashboard page component
- Navigation cards
- Welcome interface
- Responsive design

**Files to Create:**
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/components/dashboard/WelcomeCard.tsx`
- `src/components/dashboard/QuickActions.tsx`

---

## Task 1.6: Testing & Validation
**Priority:** High  
**Estimated Time:** 1 hour  
**Context:** End-to-end auth flow testing  
**Requirements:** Comprehensive testing of authentication system  
**Tech Stack:** Manual testing, browser dev tools

### Subtasks:

#### Task 1.6.1: Auth Flow Testing
**Context:** Complete authentication workflow  
**Requirements:**
- Test login with valid credentials → success
- Test login with invalid credentials → error message
- Test protected route access without auth → redirect to login
- Test logout → clears session and redirects
- Test token expiration handling
- Test browser refresh with valid token → stays logged in

**Deliverables:**
- Test scenarios documentation
- Bug fixes for any issues found
- Verification of all auth flows

#### Task 1.6.2: UI/UX Validation
**Context:** User experience and interface testing  
**Requirements:**
- Form validation messages display correctly
- Loading states work properly
- Error messages are user-friendly
- Responsive design works on mobile/tablet
- Accessibility features function correctly

**Deliverables:**
- UI/UX validation report
- Responsive design fixes
- Accessibility improvements

#### Task 1.6.3: Security Validation
**Context:** Security best practices verification  
**Requirements:**
- JWT tokens are httpOnly and secure
- Passwords are properly hashed
- No sensitive data in client-side code
- CSRF protection considerations
- Input validation works correctly

**Deliverables:**
- Security checklist completion
- Security improvements implemented
- Documentation of security measures

---

## Acceptance Criteria Summary

### Functional Requirements:
- ✅ User can login with email/password
- ✅ Invalid credentials show appropriate error
- ✅ Successful login redirects to dashboard
- ✅ Protected routes require authentication
- ✅ User can logout and session is cleared
- ✅ Auth state persists across browser refresh
- ✅ Token expiration is handled gracefully

### Technical Requirements:
- ✅ JWT tokens with 7-day expiry
- ✅ httpOnly cookies for security
- ✅ Bcrypt password hashing
- ✅ TypeScript interfaces for all auth types
- ✅ Error handling for all auth operations
- ✅ Loading states during auth operations

### UI/UX Requirements:
- ✅ Clean, modern login form
- ✅ Responsive design (mobile-friendly)
- ✅ Proper form validation with error messages
- ✅ Loading indicators during submission
- ✅ Dashboard layout with navigation
- ✅ User-friendly error messages

### Security Requirements:
- ✅ Secure password storage (bcrypt)
- ✅ JWT tokens in httpOnly cookies
- ✅ Input validation and sanitization
- ✅ Protected API routes
- ✅ No sensitive data exposure

---

## Dependencies & Prerequisites

### Required from Phase 0:
- ✅ User model with password hashing
- ✅ MongoDB connection established
- ✅ JWT utilities (sign/verify functions)
- ✅ Password hashing utilities (bcrypt)
- ✅ Auth middleware for protected routes
- ✅ Environment variables configured

### External Dependencies:
- `jsonwebtoken` - JWT token generation/verification
- `bcryptjs` - Password hashing
- `@hookform/resolvers` - Form validation
- `react-hook-form` - Form management
- `zod` - Schema validation
- `lucide-react` - Icons

---

## File Structure After Completion

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── dashboard/
│   │       └── page.tsx
│   └── api/
│       └── auth/
│           ├── login/
│           │   └── route.ts
│           ├── logout/
│           │   └── route.ts
│           └── me/
│               └── route.ts
├── components/
│   ├── auth/
│   │   ├── AuthGuard.tsx
│   │   └── LoginForm.tsx
│   ├── dashboard/
│   │   ├── Header.tsx
│   │   ├── QuickActions.tsx
│   │   ├── Sidebar.tsx
│   │   ├── UserMenu.tsx
│   │   └── WelcomeCard.tsx
│   └── ui/
│       ├── form.tsx
│       └── loading-spinner.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── useAuth.ts
├── lib/
│   └── auth/
│       └── tokenManager.ts
├── types/
│   └── auth.ts
└── middleware.ts
```

---

## Next Phase Preparation

After completing Phase 1, you'll be ready for:
- **Phase 2:** Google API Credentials Management
- **Phase 3:** Google Dork Scraper Implementation
- All subsequent phases will use the auth system established here

The authentication system provides the foundation for all protected features in the application.
