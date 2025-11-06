/**
 * Production-Grade Logger Utility
 * Provides structured logging with context for debugging and monitoring
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  endpoint?: string;
  method?: string;
  userId?: string;
  requestId?: string;
  duration?: number;
  statusCode?: number;
  [key: string]: unknown;
}

interface ErrorLogContext extends LogContext {
  error: Error | unknown;
  stack?: string;
}

/**
 * Format log message with timestamp and context
 */
const formatLog = (level: LogLevel, message: string, context?: LogContext): string => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
};

/**
 * Extract error details safely
 */
const extractErrorDetails = (error: unknown): { message: string; stack?: string; code?: string } => {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      code: (error as any).code,
    };
  }
  
  if (typeof error === 'string') {
    return { message: error };
  }
  
  return { message: 'Unknown error occurred' };
};

/**
 * Log info message
 */
export const logInfo = (message: string, context?: LogContext): void => {
  console.log(formatLog('info', message, context));
};

/**
 * Log warning message
 */
export const logWarn = (message: string, context?: LogContext): void => {
  console.warn(formatLog('warn', message, context));
};

/**
 * Log error with full context
 */
export const logError = (message: string, error: unknown, context?: LogContext): void => {
  const errorDetails = extractErrorDetails(error);
  const errorContext: ErrorLogContext = {
    ...context,
    error: errorDetails.message,
    stack: errorDetails.stack,
    errorCode: errorDetails.code,
  };
  
  console.error(formatLog('error', message, errorContext));
};

/**
 * Log debug message (only in development)
 */
export const logDebug = (message: string, context?: LogContext): void => {
  if (process.env.NODE_ENV === 'development') {
    console.debug(formatLog('debug', message, context));
  }
};

/**
 * Log API request start
 */
export const logRequestStart = (method: string, endpoint: string, context?: LogContext): void => {
  logInfo(`API Request Started: ${method} ${endpoint}`, {
    method,
    endpoint,
    ...context,
  });
};

/**
 * Log API request completion
 */
export const logRequestComplete = (
  method: string,
  endpoint: string,
  statusCode: number,
  duration: number,
  context?: LogContext
): void => {
  logInfo(`API Request Completed: ${method} ${endpoint}`, {
    method,
    endpoint,
    statusCode,
    duration,
    durationMs: `${duration}ms`,
    ...context,
  });
};

/**
 * Log database operation
 */
export const logDatabaseOperation = (
  operation: string,
  collection: string,
  context?: LogContext
): void => {
  logDebug(`Database Operation: ${operation} on ${collection}`, {
    operation,
    collection,
    ...context,
  });
};

/**
 * Log validation error
 */
export const logValidationError = (
  endpoint: string,
  errors: string | string[],
  context?: LogContext
): void => {
  logWarn(`Validation Error: ${endpoint}`, {
    endpoint,
    validationErrors: Array.isArray(errors) ? errors : [errors],
    ...context,
  });
};

/**
 * Log authentication failure
 */
export const logAuthFailure = (reason: string, context?: LogContext): void => {
  logWarn(`Authentication Failed: ${reason}`, {
    reason,
    ...context,
  });
};

/**
 * Create request context helper
 */
export const createRequestContext = (
  method: string,
  url: string,
  additionalContext?: Record<string, unknown>
): LogContext => {
  return {
    method,
    endpoint: url,
    timestamp: new Date().toISOString(),
    ...additionalContext,
  };
};
