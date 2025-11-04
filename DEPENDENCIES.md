# Required Dependencies for Phase 1: Authentication System

## Production Dependencies

```bash
npm install jsonwebtoken bcryptjs mongoose lucide-react react-hook-form
```

## Development Dependencies

```bash
npm install --save-dev @types/jsonwebtoken @types/bcryptjs
```

## shadcn/ui Components

The following shadcn/ui components are required and should be installed:

```bash
# Core components (already installed)
npx shadcn@latest add button input label card alert form dropdown-menu avatar badge

# Additional components for future phases
npx shadcn@latest add table tabs sheet progress select textarea
```

## Dependency Details

### Core Authentication
- **jsonwebtoken**: JWT token generation and verification
- **@types/jsonwebtoken**: TypeScript types for jsonwebtoken
- **bcryptjs**: Password hashing and comparison
- **@types/bcryptjs**: TypeScript types for bcryptjs

### Database
- **mongoose**: MongoDB object modeling (assumed from Phase 0)

### UI Components
- **lucide-react**: Icon library for React components

## Environment Variables Required

Create a `.env.local` file with the following variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
AUTH_COOKIE_NAME=auth-token

# MongoDB Connection (from Phase 0)
MONGODB_URI=mongodb://localhost:27017/leadharvester
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/leadharvester

# Node Environment
NODE_ENV=development
```

## Installation Commands

Run these commands in your project root:

```bash
# Install production dependencies
npm install jsonwebtoken bcryptjs mongoose lucide-react

# Install development dependencies  
npm install --save-dev @types/jsonwebtoken @types/bcryptjs

# Verify installation
npm list jsonwebtoken bcryptjs mongoose lucide-react
```

## Notes

1. **Security**: Make sure to use a strong, unique JWT_SECRET in production
2. **MongoDB**: Assumes MongoDB connection is already set up from Phase 0
3. **Next.js**: All components are built for Next.js 14 App Router
4. **TypeScript**: Full TypeScript support with proper type definitions
5. **Tailwind CSS**: UI components use Tailwind CSS classes (assumed from project setup)

## Lint Warnings

The following Tailwind CSS class warnings can be ignored or updated:
- `flex-shrink-0` can be written as `shrink-0` (newer Tailwind syntax)
- `bg-gradient-to-r` can be written as `bg-linear-to-r` (newer Tailwind syntax)

These are cosmetic warnings and don't affect functionality.
