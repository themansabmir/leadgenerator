/**
 * Authentication Guard Component
 * Higher-order component for protecting routes and components
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { FullPageLoader } from '@/components/ui/loading-spinner';
import { routeConfig } from '@/lib/auth/config';

/**
 * Auth Guard Props
 */
interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * Authentication Guard Component
 * Protects components based on authentication status
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  redirectTo = routeConfig.loginRedirect,
  requireAuth = true
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  console.log('🛡️ AuthGuard state:', { 
    isAuthenticated, 
    isLoading, 
    requireAuth, 
    hasFallback: !!fallback,
    redirecting
  });

  // Handle redirects in useEffect to avoid state updates during render
  useEffect(() => {
    console.log('🛡️ AuthGuard effect:', { isAuthenticated, isLoading, requireAuth, redirecting });
    
    if (isLoading || redirecting) {
      console.log('⏳ Still loading or already redirecting, not redirecting');
      return; // Don't redirect while loading or already redirecting
    }

    if (requireAuth && !isAuthenticated && !fallback) {
      console.log('🔄 Redirecting to login:', redirectTo);
      setRedirecting(true);
      router.push(redirectTo);
    } else if (!requireAuth && isAuthenticated) {
      console.log('🔄 Redirecting to dashboard:', routeConfig.defaultRedirect);
      setRedirecting(true);
      // Use router.replace instead of window.location to avoid infinite refresh
      router.replace(routeConfig.defaultRedirect);
    }
  }, [isAuthenticated, isLoading, requireAuth, fallback, redirectTo, router, redirecting]);

  // Show loading state while checking authentication
  if (isLoading) {
    return fallback || <FullPageLoader text="Verifying authentication..." />;
  }

  // Handle authentication requirements
  if (requireAuth && !isAuthenticated) {
    // Show loading while redirecting if no fallback provided
    if (!fallback) {
      return <FullPageLoader text="Redirecting to login..." />;
    }
    
    // Show fallback component
    return <>{fallback}</>;
  }

  // Handle case where user should not be authenticated (e.g., login page)
  if (!requireAuth && isAuthenticated) {
    console.log('🔄 User authenticated on public route, showing loading...');
    return <FullPageLoader text="Redirecting to dashboard..." />;
  }

  // User meets authentication requirements
  console.log('✅ Auth requirements met, rendering children');
  return <>{children}</>;
};

/**
 * Higher-order component for route protection
 * Functional approach to component wrapping
 */
export const withAuthGuard = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthGuardProps, 'children'> = {}
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };

  WrappedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

/**
 * Protected Route Component
 * Simplified component for protecting entire routes
 */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  );
};

/**
 * Public Route Component  
 * Component for routes that should only be accessible when not authenticated
 */
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <AuthGuard requireAuth={false}>
      {children}
    </AuthGuard>
  );
};
