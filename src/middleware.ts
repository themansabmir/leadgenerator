/**
 * Next.js Middleware for Route Protection
 * Functional approach to authentication and authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest } from '@/lib/auth/tokenManager';
import { validateTokenPipelineEdge } from '@/lib/auth/edgeTokenManager';
import { routeConfig } from '@/lib/auth/config';

/**
 * Checks if a path matches any pattern in an array
 * Pure function for path matching
 */
const matchesPath = (path: string, patterns: string[]): boolean => {
  return patterns.some(pattern => {
    if (pattern.endsWith('*')) {
      return path.startsWith(pattern.slice(0, -1));
    }
    return path === pattern || path.startsWith(pattern + '/');
  });
};

/**
 * Determines if a route is public
 * Pure function for route classification
 */
const isPublicRoute = (pathname: string): boolean => {
  return matchesPath(pathname, routeConfig.publicRoutes) || 
         pathname.startsWith('/api/auth/') ||
         pathname.startsWith('/_next/') ||
         pathname.startsWith('/favicon.ico');
};

/**
 * Determines if a route is protected
 * Pure function for protected route detection
 */
const isProtectedRoute = (pathname: string): boolean => {
  return matchesPath(pathname, routeConfig.protectedRoutes);
};

/**
 * Determines if a route is an auth route (login, register)
 * Pure function for auth route detection
 */
const isAuthRoute = (pathname: string): boolean => {
  return matchesPath(pathname, routeConfig.authRoutes);
};

/**
 * Creates redirect response
 * Pure function for creating redirects
 */
const createRedirect = (url: string, request: NextRequest): NextResponse => {
  const redirectUrl = new URL(url, request.url);
  return NextResponse.redirect(redirectUrl);
};

/**
 * Handles unauthenticated access to protected routes
 * Pure function for handling unauthorized access
 */
const handleUnauthenticated = (request: NextRequest): NextResponse => {
  const loginUrl = new URL(routeConfig.loginRedirect, request.url);
  
  // Add return URL for redirect after login
  if (request.nextUrl.pathname !== '/') {
    loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
  }
  
  return NextResponse.redirect(loginUrl);
};

/**
 * Handles authenticated access to auth routes
 * Pure function for handling already authenticated users
 */
const handleAlreadyAuthenticated = (request: NextRequest): NextResponse => {
  return createRedirect(routeConfig.defaultRedirect, request);
};

/**
 * Main middleware function
 * Handles authentication and route protection
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  console.log('🔒 Middleware:', pathname);

  // Allow public routes
  if (isPublicRoute(pathname)) {
    console.log('✅ Public route, allowing access');
    return NextResponse.next();
  }

  // Extract and validate token
  const token = extractTokenFromRequest(request);
  const payload = await validateTokenPipelineEdge(token);
  const isAuthenticated = payload !== null;

  console.log('🔒 Auth status:', { isAuthenticated, hasToken: !!token });

  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    if (!isAuthenticated) {
      console.log('🔄 Protected route, redirecting to login');
      return handleUnauthenticated(request);
    }
    console.log('✅ Protected route, user authenticated');
    // User is authenticated, allow access
    return NextResponse.next();
  }

  // Handle auth routes (login, register)
  if (isAuthRoute(pathname)) {
    if (isAuthenticated) {
      console.log('🔄 Auth route but user authenticated, would redirect to dashboard but letting AuthGuard handle it');
      // Let AuthGuard handle the redirect to avoid conflicts
      return NextResponse.next();
    }
    console.log('✅ Auth route, user not authenticated');
    // User is not authenticated, allow access to auth routes
    return NextResponse.next();
  }

  // Handle root path
  if (pathname === '/') {
    if (isAuthenticated) {
      console.log('🔄 Root path, authenticated, redirecting to dashboard');
      return createRedirect(routeConfig.defaultRedirect, request);
    } else {
      console.log('🔄 Root path, not authenticated, redirecting to login');
      return createRedirect(routeConfig.loginRedirect, request);
    }
  }

  console.log('✅ Default: allowing access');
  // Default: allow access
  return NextResponse.next();
}

/**
 * Middleware configuration
 * Specifies which paths the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
