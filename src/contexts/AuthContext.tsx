/**
 * Authentication Context Provider
 * Clean architecture with separation of concerns and functional programming
 */

'use client';

import React, { createContext, useReducer, useCallback, useEffect } from 'react';
import { AuthContextValue, LoginCredentials, SignupCredentials, AuthResponse, User } from '@/types/auth';
import { authReducer, initialAuthState, authActions, authSelectors } from '@/lib/auth/authReducer';
import { validateLoginCredentials, validateSignupCredentials } from '@/lib/auth/validation';

/**
 * Authentication Context
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Authentication service functions
 * Pure functions for API interactions
 */
const authService = {
  /**
   * Login API call
   * Pure function that returns a promise
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Login failed'
        };
      }

      return {
        success: true,
        user: data.user,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  },

  /**
   * Check authentication status
   * Pure function for auth verification
   */
  checkAuth: async (): Promise<{ user: User | null; error?: string }> => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (!response.ok) {
        return { user: null };
      }

      const data = await response.json();
      return { user: data.user };
    } catch (error) {
      return { user: null, error: 'Failed to verify authentication' };
    }
  },

  /**
   * Signup API call
   * Pure function that returns a promise
   */
  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Signup failed'
        };
      }

      return {
        success: true,
        user: data.user,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  },

  /**
   * Logout API call
   * Pure function for logout
   */
  logout: async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      // Silent fail for logout - clear local state anyway
      console.warn('Logout API call failed:', error);
    }
  }
};

/**
 * Authentication Provider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication Provider Component
 * Manages authentication state and provides auth functions
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  /**
   * Login function with validation
   * Memoized function to prevent unnecessary re-renders
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Client-side validation
    const validation = validateLoginCredentials(credentials);
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).join(', ');
      dispatch(authActions.authFailure(errorMessage));
      return {
        success: false,
        error: errorMessage
      };
    }

    dispatch(authActions.authStart());

    try {
      const result = await authService.login(credentials);

      if (result.success && result.user) {
        dispatch(authActions.authSuccess(result.user));
      } else {
        dispatch(authActions.authFailure(result.error || 'Login failed'));
      }

      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred';
      dispatch(authActions.authFailure(errorMessage));
      return {
        success: false,
        error: errorMessage
      };
    }
  }, []);

  /**
   * Signup function with validation
   * Memoized function to prevent unnecessary re-renders
   */
  const signup = useCallback(async (credentials: SignupCredentials): Promise<AuthResponse> => {
    // Client-side validation
    const validation = validateSignupCredentials(credentials);
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).join(', ');
      dispatch(authActions.authFailure(errorMessage));
      return {
        success: false,
        error: errorMessage
      };
    }

    dispatch(authActions.authStart());

    try {
      const result = await authService.signup(credentials);

      if (result.success && result.user) {
        dispatch(authActions.authSuccess(result.user));
      } else {
        dispatch(authActions.authFailure(result.error || 'Signup failed'));
      }

      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred';
      dispatch(authActions.authFailure(errorMessage));
      return {
        success: false,
        error: errorMessage
      };
    }
  }, []);

  /**
   * Logout function
   * Memoized function for logout
   */
  const logout = useCallback(async (): Promise<void> => {
    dispatch(authActions.authStart());
    
    try {
      await authService.logout();
    } finally {
      // Always clear local state, even if API call fails
      dispatch(authActions.authLogout());
    }
  }, []);

  /**
   * Check authentication status
   * Memoized function for auth check
   */
  const checkAuth = useCallback(async (): Promise<void> => {
    console.log('🔍 Checking authentication...');
    dispatch(authActions.authStart());

    try {
      const result = await authService.checkAuth();
      console.log('🔍 Auth check result:', result);

      if (result.user) {
        console.log('✅ User authenticated:', result.user.email);
        dispatch(authActions.authSuccess(result.user));
      } else {
        console.log('❌ No user found, logging out');
        dispatch(authActions.authLogout());
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      dispatch(authActions.authLogout());
    }
  }, []);

  /**
   * Clear error function
   * Memoized function to clear errors
   */
  const clearError = useCallback((): void => {
    dispatch(authActions.clearError());
  }, []);

  /**
   * Check authentication on mount
   * Effect to verify auth status when provider mounts
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Context value
   * Memoized context value to prevent unnecessary re-renders
   */
  const contextValue: AuthContextValue = React.useMemo(() => ({
    user: authSelectors.getUser(state),
    isAuthenticated: authSelectors.isAuthenticated(state),
    isLoading: authSelectors.isLoading(state),
    error: authSelectors.getError(state),
    login,
    signup,
    logout,
    checkAuth,
    clearError
  }), [state, login, signup, logout, checkAuth, clearError]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
