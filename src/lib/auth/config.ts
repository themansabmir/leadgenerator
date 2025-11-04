/**
 * Authentication configuration
 * Centralized configuration following clean architecture principles
 */

import { AuthConfig } from '@/types/auth';

/**
 * Creates authentication configuration from environment variables
 * Pure function that validates and transforms environment variables
 */
const createAuthConfig = (): AuthConfig => {
  const requiredEnvVars = {
    jwtSecret: process.env.JWT_SECRET || 'secretkey',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieName: process.env.AUTH_COOKIE_NAME || 'auth-token',
    secureCookies: process.env.NODE_ENV === 'production'
  };

  // Validate required environment variables
  if (!requiredEnvVars.jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  return Object.freeze(requiredEnvVars as AuthConfig);
};

/**
 * Immutable auth configuration instance
 */
export const authConfig = createAuthConfig();

/**
 * Route configuration for authentication
 */
export const routeConfig = Object.freeze({
  publicRoutes: ['/login', '/signup', '/register', '/forgot-password', '/unsubscribe', '/test'],
  protectedRoutes: ['/dashboard', '/queries', '/customers', '/leads', '/templates', '/campaigns', '/credentials'],
  authRoutes: ['/login', '/signup', '/register'],
  defaultRedirect: '/dashboard',
  loginRedirect: '/login'
});

/**
 * Cookie configuration
 */
export const cookieConfig = Object.freeze({
  httpOnly: true,
  secure: authConfig.secureCookies,
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
});
