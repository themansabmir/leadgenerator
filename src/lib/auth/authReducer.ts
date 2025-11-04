/**
 * Authentication state reducer
 * Pure reducer following functional programming principles
 */

import { AuthState, AuthAction, User } from '@/types/auth';

/**
 * Initial authentication state
 * Immutable initial state
 */
export const initialAuthState: AuthState = Object.freeze({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
});

/**
 * Authentication state reducer
 * Pure function that handles state transitions
 */
export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return Object.freeze({
        ...state,
        isLoading: true,
        error: null
      });

    case 'AUTH_SUCCESS':
      return Object.freeze({
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

    case 'AUTH_FAILURE':
      return Object.freeze({
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      });

    case 'AUTH_LOGOUT':
      return Object.freeze({
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });

    case 'CLEAR_ERROR':
      return Object.freeze({
        ...state,
        error: null
      });

    default:
      return state;
  }
};

/**
 * Action creators
 * Pure functions that create action objects
 */
export const authActions = Object.freeze({
  authStart: (): AuthAction => ({ type: 'AUTH_START' }),
  
  authSuccess: (user: User): AuthAction => ({ 
    type: 'AUTH_SUCCESS', 
    payload: user 
  }),
  
  authFailure: (error: string): AuthAction => ({ 
    type: 'AUTH_FAILURE', 
    payload: error 
  }),
  
  authLogout: (): AuthAction => ({ type: 'AUTH_LOGOUT' }),
  
  clearError: (): AuthAction => ({ type: 'CLEAR_ERROR' })
});

/**
 * State selectors
 * Pure functions for extracting specific state values
 */
export const authSelectors = Object.freeze({
  getUser: (state: AuthState): User | null => state.user,
  
  isAuthenticated: (state: AuthState): boolean => state.isAuthenticated,
  
  isLoading: (state: AuthState): boolean => state.isLoading,
  
  getError: (state: AuthState): string | null => state.error,
  
  hasError: (state: AuthState): boolean => state.error !== null,
  
  getUserEmail: (state: AuthState): string | null => state.user?.email || null,
  
  getUserId: (state: AuthState): string | null => state.user?.id || null
});
