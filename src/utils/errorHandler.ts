/**
 * Global Error Handler Utility
 * Handles uncaught errors and provides user-friendly error messages
 */

import { logger } from './logger'

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  [key: string]: unknown
}

/**
 * Sanitize error message for production
 */
export const sanitizeError = (error: unknown): string => {
  if (import.meta.env.PROD && !logger.isDebugEnabled()) {
    return 'An error occurred. Please try again or contact support if the problem persists.'
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unknown error occurred'
}

/**
 * Get user-friendly error message based on error type
 */
export const getUserFriendlyMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Network error. Please check your connection and try again.'
    }

    // Auth errors
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      return 'Authentication error. Please sign in again.'
    }

    // Database errors
    if (error.message.includes('database') || error.message.includes('IndexedDB')) {
      return 'Database error. Please try clearing the cache from Settings.'
    }

    // Sync errors
    if (error.message.includes('sync')) {
      return 'Sync error. Your changes are saved locally and will sync when connection is restored.'
    }
  }

  return sanitizeError(error)
}

/**
 * Handle error with context and severity
 */
export const handleError = (
  error: unknown,
  context: ErrorContext = {},
  severity: ErrorSeverity = 'medium'
): string => {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const userMessage = getUserFriendlyMessage(error)

  // Log with context
  logger.error(`${context.component || 'App'}: ${errorMessage}`, error, {
    severity,
    context,
    timestamp: new Date().toISOString(),
  })

  // In production, send critical errors to tracking service
  if (import.meta.env.PROD && severity === 'critical') {
    // Example: sendToErrorTracking(error, context, severity)
  }

  return userMessage
}

/**
 * Setup global error handlers
 */
export const setupGlobalErrorHandlers = () => {
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection', event.reason)
    event.preventDefault() // Prevent default browser error handling
  })

  // Catch global errors
  window.addEventListener('error', (event) => {
    logger.error('Global Error', event.error || event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  logger.info('Global error handlers initialized')
}
