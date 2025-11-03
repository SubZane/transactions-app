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

_All items in this section have been resolved._

---

## 🧹 Code Quality Issues

### 2. Excessive Console Logging in Production

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

### ~~3. Deprecated Tailwind Classes~~ ✅ COMPLETED

**File:** `src/components/Header.tsx:19` ✅ FIXED  
**File:** `src/components/TransactionList.tsx:200, 222` ✅ FIXED  
**Issue:** ~~`z-[1]` should be `z-1`~~ → Updated to `z-10`  
**Issue:** ~~`flex-shrink-0` should be `shrink-0`~~ → Updated to `shrink-0`  
**Fix:** ✅ Updated to modern Tailwind syntax  
**Impact:** Eliminated deprecated warnings, future-proofed styling  
**Priority:** ~~🟢 LOW~~ → ✅ COMPLETED

### 4. Missing Error Boundaries

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

### 5. Inconsistent Error Handling

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

### 6. Mixed Type Import Styles

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

_This issue has been resolved - standardized on MUI icons only._

---

## 🎯 Performance Optimization

### ~~7. Missing Memoization in TransactionList~~ ✅ COMPLETED

**File:** `src/components/TransactionList.tsx` ✅ FIXED  
**Issue:** ~~Icon component created on every render~~ → Icons now memoized with `useMemo`  
**Issue:** ~~groupTransactionsByMonth function recalculated on every render~~ → Now memoized with `useCallback`  
**Issue:** ~~Filtering happens on every render~~ → Now memoized with `useMemo`  
**Issue:** ~~Excessive unused icon imports~~ → Cleaned up to match actual database categories  
**Fix:** ✅ Added comprehensive memoization and optimization:

- Icon mappings memoized with `useMemo` and mapped to actual database categories only
- `getCategoryIcon` function memoized with `useCallback`
- `groupTransactionsByMonth` function memoized with `useCallback`
- Transaction filtering memoized with `useMemo`
- Year filtering memoized with `useMemo`
- Removed 7+ unused icon imports, reducing bundle size

**Impact:** Eliminated unnecessary re-renders, reduced bundle size (~1.3kB), improved performance  
**Priority:** ~~🟡 MEDIUM~~ → ✅ COMPLETED

### 8. No Code Splitting

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

### 9. Inefficient Search in useTransactions

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

### 10. No Tests

**Issue:** Zero test coverage  
**Fix:** Add testing setup

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Priority:** 🟠 HIGH

### 11. Missing JSDoc Comments

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

### 12. Exposed Console Errors in Production

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

### 13. No Input Sanitization

**Issue:** User inputs not sanitized before storage/display  
**Fix:** Add input validation and sanitization

```typescript
import DOMPurify from 'dompurify'

const sanitizedInput = DOMPurify.sanitize(userInput)
```

**Priority:** 🟡 MEDIUM

---

## 📦 Dependencies

### ~~14. Unused Dependencies~~ ✅ COMPLETED

**Check if these are actually used:**

- ~~`@emotion/react` & `@emotion/styled`~~ ✅ **Required by MUI** - Kept as necessary peer dependencies
- ~~`@material-tailwind/react`~~ ✅ **REMOVED** - Was completely unused, removed 47 packages
- `@mui/icons-material` ✅ **Used** - Standardized icon library in active use

**Action:** ✅ **Completed** - Removed unused Material-Tailwind, kept required MUI dependencies  
**Impact:** Reduced node_modules size, eliminated unused code, cleaner dependency tree  
**Priority:** ~~🟢 LOW~~ → ✅ COMPLETED

### 15. Large Dependencies

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

### 16. Missing EditTransactionPage Route

**File:** `src/App.tsx:40`  
**Issue:** Route defined for `/edit/:id` but uses AddTransactionPage  
**Current:**

```typescript
<Route path="/edit/:id" element={<AddTransactionPage />} />
```

**Consider:** This might be intentional (reusing component), but add comment to clarify  
**Priority:** 🟢 LOW

### ~~17. Inconsistent File Structure~~ ✅ COMPLETED

**Issue:** ~~Some components in root, some in common/~~ → Organized into logical directories  
**Fix:** ✅ Established clear folder structure and moved all components:

```
src/components/
├── common/      # Truly reusable utilities (Alert, ErrorBoundary)
├── layout/      # Layout and navigation (Header, Dock)
├── features/    # Business logic components (TransactionList, Balance*, Login, etc.)
└── ui/          # Generic UI components (ScrollToTop, InstallPWA, Offline*, etc.)
```

**Actions Completed:**

- ✅ Created organized directory structure
- ✅ Moved 15+ components to appropriate directories
- ✅ Updated all import paths throughout the codebase
- ✅ Verified build passes with new structure

**Impact:** Improved code organization, easier navigation, clearer component categorization  
**Priority:** ~~🟢 LOW~~ → ✅ COMPLETED

---

## 🎨 UI/UX

### 18. No Offline Fallback Images

**Issue:** If using images, no fallback for offline mode  
**Fix:** Add service worker caching for images  
**Priority:** 🟢 LOW

---

## 🔧 Configuration

### 19. Hardcoded Values

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

### 20. Missing Environment Variable Validation

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
- 🟠 **HIGH** (4): Should fix soon
- 🟡 **MEDIUM** (9): Fix in next sprint
- 🟢 **LOW** (7): Nice to have

### Estimated Impact

- **Performance:** ~15-20% improvement possible
- **Bundle Size:** ~100-200KB reduction possible
- **Code Quality:** Significant improvement
- **Maintainability:** Major improvement

### Next Steps

1. Fix critical import error
2. Add error boundary
3. Implement code splitting
4. Set up testing framework
5. Clean up console statements
6. Standardize error handling
7. Optimize dependencies

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
