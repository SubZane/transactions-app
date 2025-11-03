# Error Handling & Debug System

## Overview

The Transactions App includes a comprehensive error handling system with debug mode control, centralized logging, and graceful error recovery mechanisms.

## Table of Contents

- [Error Handling \& Debug System](#error-handling--debug-system)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Error Handling Features](#error-handling-features)
    - [1. Global Error Handler](#1-global-error-handler)
    - [2. React Error Boundary](#2-react-error-boundary)
    - [3. Logger Utility](#3-logger-utility)
    - [4. Debug Mode](#4-debug-mode)
  - [Usage](#usage)
    - [Using the Logger](#using-the-logger)
    - [Using Error Handler](#using-error-handler)
    - [Error Severity Levels](#error-severity-levels)
  - [Debug Mode Control](#debug-mode-control)
  - [Best Practices](#best-practices)
  - [Error Tracking Integration](#error-tracking-integration)
  - [Files](#files)

## Error Handling Features

### 1. Global Error Handler

- Catches unhandled promise rejections
- Catches global JavaScript errors
- Logs errors with context and severity
- Provides user-friendly error messages

### 2. React Error Boundary

- Catches React component errors
- Shows fallback UI instead of white screen
- Allows users to recover gracefully
- Displays error details in debug mode

### 3. Logger Utility

- Centralized logging system
- Debug mode toggle (Settings page)
- Respects environment (dev vs prod)
- Consistent log formatting

### 4. Debug Mode

- Toggle in Settings page
- Persisted in localStorage
- Always enabled in development
- Shows detailed error messages when enabled

## Usage

### Using the Logger

```typescript
import { logger } from '../utils/logger'

// Debug logs (only shown if debug mode is ON or in dev)
logger.debug('Syncing transaction', { id: '123', data })

// Info logs (always shown)
logger.info('User logged in', { userId })

// Warning logs (always shown)
logger.warn('Slow network detected')

// Error logs (always shown + sent to error tracking in prod)
logger.error('Failed to sync', error, { context: 'sync-service' })

// Success logs (only in debug mode)
logger.success('Transaction synced successfully')
```

### Using Error Handler

```typescript
import { handleError } from '../utils/errorHandler'

try {
  await riskyOperation()
} catch (error) {
  const userMessage = handleError(
    error,
    {
      component: 'TransactionForm',
      action: 'save',
      userId: user.id,
    },
    'high'
  )

  setError(userMessage) // Show to user
}
```

### Error Severity Levels

- `low`: Minor issues, no user impact
- `medium`: User-facing error, but recoverable (default)
- `high`: Significant error, affects functionality
- `critical`: Major error, sent to tracking service in production

## Debug Mode Control

**In Development:**

- Always enabled
- Cannot be disabled
- Shows all debug logs

**In Production/Preview:**

- Off by default
- Toggle in Settings → App Settings → Debug Mode
- Persists across sessions
- Shows debug logs and error details when enabled

## Best Practices

1. **Use appropriate log levels:**
   - Debug: Development info, verbose details
   - Info: Important state changes
   - Warn: Potential issues
   - Error: Actual errors

2. **Include context:**

   ```typescript
   logger.error('API call failed', error, {
     endpoint: '/transactions',
     userId: user.id,
     attempt: retryCount,
   })
   ```

3. **User-friendly messages:**
   - Show technical details only in debug mode
   - Provide actionable guidance in production

4. **Error handling patterns:**

   ```typescript
   // ❌ Bad
   .catch(error => console.error(error))

   // ✅ Good
   .catch(error => {
     const message = handleError(error, { component: 'MyComponent' })
     setError(message)
   })
   ```

## Error Tracking Integration

To add error tracking (e.g., Sentry):

1. Install service: `npm install @sentry/react`
2. Update `src/utils/errorHandler.ts`:

   ```typescript
   import * as Sentry from '@sentry/react'

   // In handleError function
   if (import.meta.env.PROD && severity === 'critical') {
     Sentry.captureException(error, { contexts: { custom: context } })
   }
   ```

3. Initialize in `main.tsx`

## Files

- `src/utils/logger.ts` - Logging utility
- `src/utils/errorHandler.ts` - Error handling utility
- `src/components/common/ErrorBoundary.tsx` - React error boundary
- `src/pages/SettingsPage.tsx` - Debug mode toggle UI
