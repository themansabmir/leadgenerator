/**
 * Authentication validation utilities
 * Pure functions for input validation following functional programming principles
 */

import { LoginCredentials, SignupCredentials, ValidationResult } from '@/types/auth';

/**
 * Email validation regex pattern
 * RFC 5322 compliant email validation
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Password validation requirements
 */
const PASSWORD_MIN_LENGTH = 8;

/**
 * Validates email format
 * Pure function for email validation
 */
export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Validates password strength
 * Pure function for password validation
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= PASSWORD_MIN_LENGTH;
};

/**
 * Validates required field presence
 * Pure function for required field validation
 */
export const isRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validates login credentials
 * Pure function that returns validation result
 */
export const validateLoginCredentials = (credentials: LoginCredentials): ValidationResult => {
  const errors: Record<string, string> = {};

  // Email validation
  if (!isRequired(credentials.email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(credentials.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!isRequired(credentials.password)) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(credentials.password)) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates signup credentials
 * Pure function that returns validation result
 */
export const validateSignupCredentials = (credentials: SignupCredentials): ValidationResult => {
  const errors: Record<string, string> = {};

  // Email validation
  if (!isRequired(credentials.email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(credentials.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!isRequired(credentials.password)) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(credentials.password)) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
  }

  // Confirm password validation
  if (!isRequired(credentials.confirmPassword)) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (credentials.password !== credentials.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitizes email input
 * Pure function for input sanitization
 */
export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

/**
 * Creates validation error messages
 * Pure function for error message formatting
 */
export const formatValidationErrors = (errors: Record<string, string>): string => {
  return Object.values(errors).join(', ');
};

/**
 * Higher-order function for field validation
 * Functional composition for validation rules
 */
export const createValidator = <T>(
  validationRules: Array<(value: T) => string | null>
) => {
  return (value: T): ValidationResult => {
    const errors: string[] = [];
    
    for (const rule of validationRules) {
      const error = rule(value);
      if (error) {
        errors.push(error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors: { field: errors.join(', ') }
    };
  };
};

/**
 * Validation rule factories
 * Pure functions that return validation rules
 */
export const validationRules = {
  required: (fieldName: string) => (value: string) => 
    isRequired(value) ? null : `${fieldName} is required`,
  
  email: () => (value: string) => 
    isValidEmail(value) ? null : 'Please enter a valid email address',
  
  minLength: (min: number, fieldName: string) => (value: string) => 
    value.length >= min ? null : `${fieldName} must be at least ${min} characters long`,
  
  maxLength: (max: number, fieldName: string) => (value: string) => 
    value.length <= max ? null : `${fieldName} must be no more than ${max} characters long`
};
