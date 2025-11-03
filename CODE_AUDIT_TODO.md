# Code Audit TODO List

**Generated:** November 3, 2025  
**Branch:** main  
**Status:** 🔍 Review Required

---

## 🚨 Critical Issues (Fix Immediately)

### 1. Import Error in sync.service.ts

**File:** `src/services/sync.service.ts:7`  
**Issue:** Malformed import with trailing `type` keyword  
**Current:**

```typescript
import { dbService, OfflineTransaction, SyncQueueItem, type } from './db.service'
```

**Fix:**

```typescript
import { dbService, type OfflineTransaction, type SyncQueueItem } from './db.service'
```

**Impact:** Build failure  
**Priority:** 🔴 CRITICAL

---

## ⚠️ Memory Leaks & Resource Management

### 2. Missing Cleanup in UpdatePrompt Component ✅ FIXED

**File:** `src/components/common/UpdatePrompt.tsx:18`  
**Issue:** `setInterval` without cleanup in `onRegistered` callback  
**Status:** ✅ Fixed - Added useEffect cleanup and intervalRef  
**Date Fixed:** November 3, 2025

**Previous Code:**

```typescript
onRegistered(registration: ServiceWorkerRegistration | undefined) {
  if (registration) {
    setInterval(() => {
      registration.update()
    }, 60000)
  }
}
```

**Fixed Code:**

```typescript
const intervalRef = useRef<number | null>(null)

useEffect(() => {
  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }
}, [])

onRegistered(registration) {
  if (registration) {
    intervalRef.current = setInterval(() => {
      registration.update()
    }, 60000) as unknown as number
  }
}
```

**Impact:** Memory leak - interval continues after component unmount  
**Priority:** 🟠 HIGH

### 3. Uncleaned Timeouts in ProfilePage ✅ FIXED

**File:** `src/pages/ProfilePage.tsx` (lines 70, 111, 143, 191, 501)  
**Issue:** Multiple `setTimeout` calls without cleanup  
**Status:** ✅ Fixed - Added timeout tracking with useRef and cleanup on unmount  
**Date Fixed:** November 3, 2025

**Previous Code:**

```typescript
setTimeout(() => setSuccess(null), 3000)
```

**Fixed Code:**

```typescript
// Added ref to track timeouts
const timeoutRefs = useRef<number[]>([])

// Added cleanup on unmount
useEffect(() => {
  return () => {
    timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId))
    timeoutRefs.current = []
  }
}, [])

// Helper function to track timeouts
const setTrackedTimeout = (callback: () => void, delay: number) => {
  const timeoutId = setTimeout(() => {
    callback()
    timeoutRefs.current = timeoutRefs.current.filter((id) => id !== timeoutId)
  }, delay) as unknown as number
  timeoutRefs.current.push(timeoutId)
  return timeoutId
}

// Usage throughout component
setTrackedTimeout(() => setSuccess(null), 3000)
```

**Impact:** Minor memory leak, stale state updates  
**Priority:** 🟡 MEDIUM

### 4. SyncService Missing Cleanup on Unmount ✅ ALREADY FIXED

**File:** `src/hooks/useOffline.ts:33-51`  
**Issue:** `syncService.startAutoSync()` called but never stopped  
**Status:** ✅ Already implemented correctly  
**Date Verified:** November 3, 2025

**Current Code (Already Correct):**

```typescript
useEffect(() => {
  const init = async () => {
    await dbService.init()
    syncService.startAutoSync()
    // ...
  }
  init()

  return () => {
    syncService.stopAutoSync()
  }
}, [])
```

**Implementation Details:**

- The useOffline hook already has proper cleanup in place
- `syncService.stopAutoSync()` clears the interval timer
- Event listeners are properly removed on unmount
- No changes needed - this was already implemented correctly

**Impact:** Background sync continues after component unmount  
**Priority:** 🟠 HIGH

---

## 🧹 Code Quality Issues

### 5. Excessive Console Logging in Production

**Files:** Multiple files (20+ instances)  
**Issue:** Console statements left in production code  
**Examples:**

- `src/services/sync.service.ts`: 8 console.log statements
- `src/pages/AddTransactionPage.tsx`: 4 console.error statements
- `src/pages/ProfilePage.tsx`: Multiple console.error statements

**Fix:**

- Remove or wrap in development checks
- Use proper logging library

```typescript
const isDev = import.meta.env.DEV

if (isDev) {
  console.log('Debug info')
}
```

**Impact:** Performance, security (exposing internal logic)  
**Priority:** 🟡 MEDIUM

### 6. Deprecated Tailwind Classes

**File:** `src/components/Header.tsx:19`  
**Issue:** `z-[1]` should be `z-1`  
**File:** `src/components/TransactionList.tsx:200, 222`  
**Issue:** `flex-shrink-0` should be `shrink-0`  
**Fix:** Update to modern Tailwind syntax  
**Impact:** Deprecated warnings, potential breaking changes in future  
**Priority:** 🟢 LOW

### 7. Missing Error Boundaries

**File:** `src/App.tsx`  
**Issue:** No React Error Boundary to catch runtime errors  
**Fix:** Wrap app in ErrorBoundary component

```typescript
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

// In App:
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <Routes>...</Routes>
</ErrorBoundary>
```

**Impact:** Unhandled errors crash entire app  
**Priority:** 🟠 HIGH

---

## 🔄 Inconsistencies

### 8. Inconsistent Error Handling

**Issue:** Mix of different error handling patterns across files  
**Examples:**

- Some components catch and set error state
- Some log to console only
- Some show alerts, some don't

**Fix:** Standardize error handling

```typescript
// Create error handling utility
export const handleError = (error: unknown, context: string) => {
  const message = error instanceof Error ? error.message : 'Unknown error'

  if (import.meta.env.DEV) {
    console.error(`Error in ${context}:`, error)
  }

  // Could also send to error tracking service
  return message
}
```

**Priority:** 🟡 MEDIUM

### 9. Mixed Type Import Styles

**Issue:** Inconsistent use of `type` imports  
**Examples:**

- `import type { Transaction }` (correct)
- `import { Transaction }` (should use type)
- Mix of both in same file

**Fix:** Enforce consistent type imports

```typescript
// Always use 'type' for type-only imports
import type { Transaction, Category } from './types'
import { transactionService } from './services'
```

**Priority:** 🟢 LOW

### 10. Duplicate Icon Libraries

**File:** `package.json`  
**Issue:** Using both `@heroicons/react` AND `@mui/icons-material`  
**Current Dependencies:**

```json
"@heroicons/react": "^2.2.0",
"@mui/icons-material": "^7.3.4",
```

**Fix:** Standardize on one icon library  
**Impact:** Bundle size (~200KB+ unnecessary)  
**Priority:** 🟡 MEDIUM

---

## 🎯 Performance Optimization

### 11. Missing Memoization in TransactionList

**File:** `src/components/TransactionList.tsx`  
**Issue:** Icon component created on every render  
**Fix:** Use `useMemo` for icon mappings

```typescript
const iconMap = useMemo(() => ({
  Groceries: <ShoppingCartIcon />,
  Car: <DirectionsCarIcon />,
  // ...
}), [])
```

**Impact:** Unnecessary re-renders  
**Priority:** 🟡 MEDIUM

### 12. No Code Splitting

**File:** `src/App.tsx`  
**Issue:** All pages loaded upfront  
**Fix:** Use React.lazy for route-based code splitting

```typescript
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const AddTransactionPage = lazy(() => import('./pages/AddTransactionPage'))

// Wrap routes in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>...</Routes>
</Suspense>
```

**Impact:** Initial bundle size, slower first load  
**Priority:** 🟠 HIGH

### 13. Inefficient Search in useTransactions

**File:** `src/hooks/useTransactions.ts`  
**Issue:** Filtering happens on every render  
**Fix:** Use `useMemo` for filtered results

```typescript
const filteredTransactions = useMemo(() => {
  return allTransactions.filter(...)
}, [allTransactions, filter, searchQuery])
```

**Priority:** 🟡 MEDIUM

---

## 🧪 Testing & Documentation

### 14. No Tests

**Issue:** Zero test coverage  
**Fix:** Add testing setup

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Priority:** 🟠 HIGH

### 15. Missing JSDoc Comments

**Issue:** Many functions lack documentation  
**Fix:** Add JSDoc comments to public APIs

```typescript
/**
 * Syncs local data with remote server
 * @returns Promise that resolves when sync completes
 * @throws {Error} If sync fails after max retries
 */
async syncNow(): Promise<void>
```

**Priority:** 🟢 LOW

---

## 🔐 Security

### 16. Exposed Console Errors in Production

**Issue:** Stack traces and internal errors visible in console  
**Fix:** Sanitize error messages in production

```typescript
const sanitizeError = (error: unknown) => {
  if (import.meta.env.PROD) {
    return 'An error occurred. Please try again.'
  }
  return error instanceof Error ? error.message : 'Unknown error'
}
```

**Priority:** 🟡 MEDIUM

### 17. No Input Sanitization

**Issue:** User inputs not sanitized before storage/display  
**Fix:** Add input validation and sanitization

```typescript
import DOMPurify from 'dompurify'

const sanitizedInput = DOMPurify.sanitize(userInput)
```

**Priority:** 🟡 MEDIUM

---

## 📦 Dependencies

### 18. Unused Dependencies (Potential)

**Check if these are actually used:**

- `@emotion/react` & `@emotion/styled` - Only needed if using emotion CSS
- `@material-tailwind/react` - Check if used alongside MUI
- `@heroicons/react` - If standardizing on MUI icons

**Action:** Audit imports and remove unused packages  
**Priority:** 🟢 LOW

### 19. Large Dependencies

**Issue:** Some dependencies are quite large  
**Examples:**

- `@mui/material` (7.3.4) - Large bundle
- `xlsx` (0.18.5) - Large Excel library

**Consider:**

- Tree-shaking for MUI
- Alternative for XLSX if only exporting (use CSV instead?)

**Priority:** 🟢 LOW

---

## 📝 Code Organization

### 20. Missing EditTransactionPage Route

**File:** `src/App.tsx:40`  
**Issue:** Route defined for `/edit/:id` but uses AddTransactionPage  
**Current:**

```typescript
<Route path="/edit/:id" element={<AddTransactionPage />} />
```

**Consider:** This might be intentional (reusing component), but add comment to clarify  
**Priority:** 🟢 LOW

### 21. Inconsistent File Structure

**Issue:** Some components in root, some in common/  
**Fix:** Establish clear folder structure

```
src/components/
├── common/      # Reusable UI components
├── layout/      # Layout components (Header, Dock)
└── features/    # Feature-specific components
```

**Priority:** 🟢 LOW

---

## 🎨 UI/UX

### 22. No Loading State for Sync

**File:** `src/components/common/OfflineIndicator.tsx`  
**Issue:** Sync button doesn't show loading state during manual sync  
**Fix:** Add loading indicator

```typescript
<button disabled={isSyncing}>
  {isSyncing ? <Spinner /> : <SyncIcon />}
  {isSyncing ? 'Syncing...' : 'Sync Now'}
</button>
```

**Priority:** 🟡 MEDIUM

### 23. No Offline Fallback Images

**Issue:** If using images, no fallback for offline mode  
**Fix:** Add service worker caching for images  
**Priority:** 🟢 LOW

---

## 🔧 Configuration

### 24. Hardcoded Values

**Issue:** Magic numbers and strings throughout code  
**Examples:**

- Sync interval: 30000ms (hardcoded)
- Retry count: 3 (hardcoded)

**Fix:** Move to constants file

```typescript
// src/utils/constants.ts
export const SYNC_INTERVAL = 30_000
export const MAX_RETRY_COUNT = 3
export const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
```

**Priority:** 🟡 MEDIUM

### 25. Missing Environment Variable Validation

**Issue:** No validation that required env vars are present  
**Fix:** Add env validation

```typescript
// src/lib/env.ts
const requiredEnvVars = [
  'VITE_API_USERS_URL',
  'VITE_API_CATEGORIES_URL',
  'VITE_API_TRANSACTIONS_URL',
] as const

requiredEnvVars.forEach((key) => {
  if (!import.meta.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
})
```

**Priority:** 🟡 MEDIUM

---

## 📊 Summary

### Priority Breakdown

- 🔴 **CRITICAL** (1): Must fix before next deployment
- 🟠 **HIGH** (5): Should fix soon
- 🟡 **MEDIUM** (12): Fix in next sprint
- 🟢 **LOW** (7): Nice to have

### Estimated Impact

- **Performance:** ~15-20% improvement possible
- **Bundle Size:** ~200-300KB reduction possible
- **Code Quality:** Significant improvement
- **Maintainability:** Major improvement

### Next Steps

1. Fix critical import error
2. Address memory leaks
3. Add error boundary
4. Implement code splitting
5. Set up testing framework
6. Clean up console statements
7. Standardize error handling
8. Optimize dependencies

---

## 🤝 Contributing

When addressing these issues:

1. Create a new branch for each fix
2. Add tests where applicable
3. Update documentation
4. Request code review
5. Ensure build passes before merging

---

**Note:** This is a living document. Update as issues are resolved or new ones are discovered.
