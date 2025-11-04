/**
 * Authentication hook
 * Custom hook for accessing authentication context
 */

'use client';

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { AuthContextValue } from '@/types/auth';

/**
 * Custom hook for authentication
 * Provides type-safe access to auth context
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

/**
 * Hook for authentication status
 * Returns only authentication status for components that don't need full context
 */
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
};

/**
 * Hook for current user
 * Returns only user data for components that need user info
 */
export const useCurrentUser = () => {
  const { user, isAuthenticated } = useAuth();
  return { user, isAuthenticated };
};

/**
 * Hook for authentication actions
 * Returns only auth functions for components that need to trigger auth actions
 */
export const useAuthActions = () => {
  const { login, signup, logout, checkAuth, clearError } = useAuth();
  return { login, signup, logout, checkAuth, clearError };
};
