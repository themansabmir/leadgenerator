/**
 * Authentication types and interfaces
 * Following functional programming principles with immutable data structures
 */

export interface User {
  readonly id: string;
  readonly email: string;
  readonly createdAt: Date;
}

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

export interface SignupCredentials {
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
}

export interface AuthResponse {
  readonly success: boolean;
  readonly user?: User;
  readonly message?: string;
  readonly error?: string;
}

export interface TokenPayload {
  readonly userId: string;
  readonly email: string;
  readonly iat: number;
  readonly exp: number;
}

export interface AuthState {
  readonly user: User | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly error: string | null;
}

export interface AuthContextValue extends AuthState {
  readonly login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  readonly signup: (credentials: SignupCredentials) => Promise<AuthResponse>;
  readonly logout: () => Promise<void>;
  readonly checkAuth: () => Promise<void>;
  readonly clearError: () => void;
}

// API Response types
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly message?: string;
  readonly error?: string;
}

// Form validation types
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: Record<string, string>;
}

// Route protection types
export interface RouteConfig {
  readonly path: string;
  readonly isProtected: boolean;
  readonly redirectTo?: string;
}

export type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Environment configuration type
export interface AuthConfig {
  readonly jwtSecret: string;
  readonly jwtExpiresIn: string;
  readonly cookieName: string;
  readonly secureCookies: boolean;
}
