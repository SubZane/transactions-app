# Coding Guidelines & Standards

## Overview

This document outlines the comprehensive coding standards, conventions, and best practices for the Transactions App project. All team members should follow these guidelines to ensure code consistency, maintainability, and quality.

## Table of Contents

- [General Principles](#general-principles)
- [TypeScript Standards](#typescript-standards)
- [React Patterns](#react-patterns)
- [Styling Guidelines](#styling-guidelines)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Documentation Standards](#documentation-standards)
- [Error Handling](#error-handling)
- [Testing Guidelines](#testing-guidelines)
- [Performance Best Practices](#performance-best-practices)
- [Code Review Guidelines](#code-review-guidelines)

## General Principles

### 1. Code Quality

- **Write clean, readable, and maintainable code**
- **Follow the DRY (Don't Repeat Yourself) principle**
- **Keep functions and components small and focused** (under 50 lines when possible)
- **Use meaningful names** for variables, functions, and components
- **Prefer composition over inheritance**
- **Keep files under 500 lines** - Large files become difficult to maintain
- **Extract functions into separate files** - Promote reusability and maintainability
- **Make functions reusable** - Write generic, well-abstracted functions

### 2. Code Consistency

- **Use ESLint and Prettier** for consistent formatting
- **Run `npm run lint:fix`** before committing code
- **Follow established patterns** in the codebase
- **Use consistent import ordering** (external libraries, internal modules, relative imports)

### 3. Development Workflow

```bash
# Before committing
npm run lint:fix
npm run type-check
npm run test
npm run build
```

## TypeScript Standards

### 1. Type Definitions

```typescript
// ✅ Good: Use interfaces for object types
interface Transaction {
  id: number
  amount: number
  description?: string
  category_id: number | null
  user_id: number
  created_at: string
}

// ✅ Good: Use type for unions and primitives
type TransactionType = 'deposit' | 'expense'
type Status = 'pending' | 'success' | 'error'

// ❌ Avoid: Using 'any' type
const data: any = fetchData() // Bad

// ✅ Good: Use specific types or unknown
const data: Transaction[] = await transactionService.getAll()
const unknownData: unknown = await fetchExternalData()
```

### 2. Type Inference

```typescript
// ✅ Good: Let TypeScript infer when obvious
const count = 5
const message = 'Transaction saved successfully'

// ✅ Good: Explicit types for function parameters and returns
function calculateTotal(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0)
}

// ✅ Good: Generic types for reusable functions
function createApiResponse<T>(data: T, success: boolean): ApiResponse<T> {
  return { data, success, timestamp: new Date().toISOString() }
}
```

### 3. Nullable Values

```typescript
// ✅ Good: Use optional chaining and nullish coalescing
const categoryName = transaction.category?.name ?? 'Uncategorized'
const userName = user?.firstname ?? 'Unknown User'

// ✅ Good: Type guards for null checking
function isValidTransaction(t: Transaction | null): t is Transaction {
  return t !== null && t.amount > 0
}

if (isValidTransaction(transaction)) {
  // TypeScript knows transaction is not null here
  processTransaction(transaction)
}
```

### 4. Utility Types

```typescript
// ✅ Good: Use utility types for transformations
type CreateTransaction = Omit<Transaction, 'id' | 'created_at'>
type UpdateTransaction = Partial<Pick<Transaction, 'amount' | 'description'>>

// ✅ Good: Create type-safe API response types
interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
}

type TransactionResponse = ApiResponse<Transaction[]>
```

## React Patterns

### 1. Component Structure

```typescript
import { FC, useState, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'

// External library imports
import EditIcon from '@mui/icons-material/Edit'

// Internal imports
import { transactionService } from '../services/transaction.service'
import { formatCurrency } from '../utils/formatters'

// Type definitions
interface TransactionCardProps {
  transaction: Transaction
  onEdit?: (id: number) => void
  className?: string
}

// Component implementation
export const TransactionCard: FC<TransactionCardProps> = memo(({
  transaction,
  onEdit,
  className = ''
}) => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(transaction.id)
    } else {
      navigate(`/edit/${transaction.id}`)
    }
  }, [transaction.id, onEdit, navigate])

  return (
    <div className={`transaction-card ${className}`}>
      <div className="card-body">
        <h3>{transaction.description || 'No description'}</h3>
        <p className="amount">{formatCurrency(transaction.amount)}</p>
        <button onClick={handleEdit} disabled={isLoading}>
          <EditIcon fontSize="small" />
          Edit
        </button>
      </div>
    </div>
  )
})

TransactionCard.displayName = 'TransactionCard'
```

### 2. Hooks Usage

```typescript
// ✅ Good: Custom hooks for reusable logic
function useTransactions(userId: number) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await transactionService.getByUserId(userId)
      setTransactions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return { transactions, isLoading, error, refetch: fetchTransactions }
}

// ✅ Good: Memoization for performance
const expensiveValue = useMemo(() => {
  return transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
}, [transactions])
```

### 3. Event Handlers

```typescript
// ✅ Good: Use useCallback for event handlers in memoized components
const handleSubmit = useCallback(
  async (formData: CreateTransaction) => {
    try {
      setIsSubmitting(true)
      await transactionService.create(formData)
      onSuccess?.()
      navigate('/transactions')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create transaction')
    } finally {
      setIsSubmitting(false)
    }
  },
  [onSuccess, navigate]
)

// ✅ Good: Type event handlers properly
const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target
  setFormData((prev) => ({ ...prev, [name]: value }))
}, [])
```

## Styling Guidelines

### 1. Tailwind CSS Classes

```typescript
// ✅ Good: Use semantic class grouping
<div className="
  flex items-center justify-between
  p-4 md:p-6
  bg-white border border-gray-200 rounded-lg
  hover:border-emerald-300 transition-colors
">

// ✅ Good: Use design system tokens
<span className="text-success">+{formatCurrency(amount)}</span>
<span className="text-error">-{formatCurrency(amount)}</span>

// ✅ Good: Responsive design patterns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### 2. Component Styling

```typescript
// ✅ Good: Conditional styling with clear logic
const getAmountColor = (type: TransactionType) => {
  return type === 'deposit' ? 'text-success' : 'text-error'
}

<span className={`font-bold ${getAmountColor(transaction.type)}`}>
  {formatAmount(transaction.amount, transaction.type)}
</span>

// ✅ Good: Use CSS variables for consistent theming
<div
  style={{
    '--primary-color': '#10b981',
    '--secondary-color': '#6b7280'
  } as React.CSSProperties}
>
```

## File Organization

### 1. Directory Structure

```
src/
├── components/          # React components
│   ├── common/         # Shared components
│   ├── features/       # Feature-specific components
│   ├── layout/         # Layout components
│   └── ui/             # Pure UI components
├── hooks/              # Custom React hooks
├── services/           # API service layers
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # Application constants
└── styles/             # Styling files
```

### 2. File Naming

```
// Components (PascalCase)
TransactionList.tsx
AddTransactionForm.tsx
UserProfile.tsx

// Hooks (camelCase with 'use' prefix)
useAuth.ts
useTransactions.ts
useLocalStorage.ts

// Services (camelCase with service suffix)
transaction.service.ts
category.service.ts
api.service.ts

// Utils (camelCase)
formatters.ts
validators.ts
constants.ts

// Types (camelCase with types suffix)
auth.types.ts
transaction.types.ts
api.types.ts
```

### 3. Import Organization

```typescript
// 1. External library imports
import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SaveIcon from '@mui/icons-material/Save'

// 2. Internal service imports
import { transactionService } from '../services/transaction.service'
import { useAuth } from '../hooks/useAuth'

// 3. Type imports
import type { Transaction, CreateTransactionData } from '../types/transaction.types'

// 4. Relative imports
import { TransactionForm } from './TransactionForm'
import { LoadingSpinner } from '../common/LoadingSpinner'
```

## Naming Conventions

### 1. Variables and Functions

```typescript
// ✅ Good: Descriptive camelCase
const userTransactions = await fetchUserTransactions(userId)
const isFormValid = validateTransactionForm(formData)
const handleFormSubmit = () => {
  /* ... */
}

// ❌ Bad: Abbreviated or unclear names
const usrTxns = await fetchTxns(id)
const valid = validate(data)
const handle = () => {
  /* ... */
}
```

### 2. Constants

```typescript
// ✅ Good: SCREAMING_SNAKE_CASE for module constants
export const API_BASE_URL = 'http://localhost/backend'
export const MAX_TRANSACTION_AMOUNT = 1000000
export const DEFAULT_CURRENCY = 'SEK'

// ✅ Good: camelCase for local constants
const defaultFormData = {
  amount: '',
  description: '',
  type: 'expense' as const,
}
```

### 3. Component Props

```typescript
// ✅ Good: Descriptive prop names
interface TransactionListProps {
  transactions: Transaction[]
  isLoading?: boolean
  onTransactionEdit?: (id: number) => void
  emptyStateMessage?: string
}

// ✅ Good: Event handler naming
interface FormProps {
  onSubmit: (data: FormData) => void
  onCancel: () => void
  onFieldChange: (field: string, value: string) => void
}
```

## Documentation Standards

### 1. Component Documentation

````typescript
/**
 * TransactionList component displays a list of financial transactions
 * with filtering, sorting, and edit capabilities.
 *
 * @param transactions - Array of transaction objects to display
 * @param isLoading - Whether the component is in a loading state
 * @param onEdit - Callback when a transaction edit is requested
 *
 * @example
 * ```tsx
 * <TransactionList
 *   transactions={userTransactions}
 *   isLoading={isLoadingTransactions}
 *   onEdit={(id) => navigate(`/edit/${id}`)}
 * />
 * ```
 */
export const TransactionList: FC<TransactionListProps> = ({ ... }) => {
````

### 2. Function Documentation

````typescript
/**
 * Formats a monetary amount according to Swedish currency standards
 *
 * @param amount - The amount to format in öre (1/100 SEK)
 * @param showCurrency - Whether to include currency symbol
 * @returns Formatted currency string (e.g., "1 234,56 kr")
 *
 * @example
 * ```typescript
 * formatCurrency(123456) // "1 234,56 kr"
 * formatCurrency(123456, false) // "1 234,56"
 * ```
 */
export function formatCurrency(amount: number, showCurrency = true): string {
  // Implementation...
}
````

### 3. Type Documentation

```typescript
/**
 * Represents a financial transaction in the system
 */
interface Transaction {
  /** Unique identifier for the transaction */
  id: number
  /** Transaction amount in öre (1/100 SEK) */
  amount: number
  /** Optional description of the transaction */
  description?: string
  /** Type of transaction */
  type: 'deposit' | 'expense'
  /** When the transaction was created */
  created_at: string
}
```

## Error Handling

### 1. Error Boundaries

```typescript
// ✅ Good: Implement error boundaries for component trees
class TransactionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Transaction component error', error, { errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return <TransactionErrorFallback onRetry={this.handleRetry} />
    }

    return this.props.children
  }
}
```

### 2. API Error Handling

```typescript
// ✅ Good: Consistent error handling pattern
async function createTransaction(data: CreateTransactionData): Promise<Transaction> {
  try {
    const response = await api.post('/transactions', data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 400) {
        throw new ValidationError(error.response.data.message)
      }
      if (error.response?.status === 401) {
        throw new AuthenticationError('Session expired')
      }
    }

    throw new NetworkError('Failed to create transaction')
  }
}
```

## Testing Guidelines

### 1. Component Testing

```typescript
// ✅ Good: Test component behavior, not implementation
describe('TransactionCard', () => {
  const mockTransaction: Transaction = {
    id: 1,
    amount: 12500,
    description: 'Grocery shopping',
    type: 'expense',
    created_at: '2023-10-15T10:30:00Z'
  }

  it('displays transaction information correctly', () => {
    render(<TransactionCard transaction={mockTransaction} />)

    expect(screen.getByText('Grocery shopping')).toBeInTheDocument()
    expect(screen.getByText('125,00 kr')).toBeInTheDocument()
    expect(screen.getByText('Expense')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn()
    render(<TransactionCard transaction={mockTransaction} onEdit={onEdit} />)

    fireEvent.click(screen.getByRole('button', { name: /edit/i }))

    expect(onEdit).toHaveBeenCalledWith(1)
  })
})
```

### 2. Hook Testing

```typescript
// ✅ Good: Test custom hooks with react-hooks-testing-library
describe('useTransactions', () => {
  it('fetches transactions on mount', async () => {
    const mockTransactions = [mockTransaction]
    jest.spyOn(transactionService, 'getAll').mockResolvedValue(mockTransactions)

    const { result } = renderHook(() => useTransactions())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.transactions).toEqual(mockTransactions)
    })
  })
})
```

## Performance Best Practices

### 1. Component Optimization

```typescript
// ✅ Good: Memoize expensive components
export const TransactionList = memo(({ transactions, searchQuery }) => {
  // Memoize filtered data
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t =>
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [transactions, searchQuery])

  return (
    <div>
      {filteredTransactions.map(transaction => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
    </div>
  )
})

// ✅ Good: Memoize callback functions
const handleTransactionEdit = useCallback((id: number) => {
  navigate(`/edit/${id}`)
}, [navigate])
```

### 2. Bundle Optimization

```typescript
// ✅ Good: Lazy load non-critical components
const AddTransactionPage = lazy(() => import('./pages/AddTransactionPage'))
const EditTransactionPage = lazy(() => import('./pages/EditTransactionPage'))

// ✅ Good: Use dynamic imports for large libraries
const loadChartLibrary = async () => {
  const chartModule = await import('chart.js')
  return chartModule.Chart
}
```

## Code Review Guidelines

### 1. Review Checklist

- [ ] **Code follows naming conventions**
- [ ] **Components are properly typed**
- [ ] **Error handling is implemented**
- [ ] **Performance considerations are addressed**
- [ ] **Tests are included for new functionality**
- [ ] **Documentation is updated if needed**
- [ ] **No console.log statements in production code**
- [ ] **Imports are organized correctly**

### 2. Review Comments

```typescript
// ✅ Good: Constructive feedback
// Consider extracting this logic into a custom hook for reusability
// This component is getting large, consider splitting into smaller components
// Add error handling for this API call

// ❌ Bad: Non-constructive criticism
// This is wrong
// Fix this
// Bad code
```

### 3. Common Issues to Look For

- **Memory leaks** (useEffect cleanup)
- **Unnecessary re-renders** (missing memoization)
- **Type safety** (any types, missing null checks)
- **Accessibility** (missing ARIA labels, keyboard navigation)
- **Security** (XSS vulnerabilities, data validation)

## Best Practices Summary

### Do's ✅

- Use TypeScript strictly (no `any` types)
- Write meaningful variable and function names
- Implement proper error handling
- Add JSDoc comments for public APIs
- Use React.memo() for expensive components
- Implement loading and error states
- Write tests for critical functionality
- Use semantic HTML elements
- Follow the established file structure

### Don'ts ❌

- Don't use `any` type
- Don't leave console.log statements
- Don't ignore TypeScript errors
- Don't skip error handling
- Don't create god components (>500 lines)
- Don't directly mutate state
- Don't use inline styles (use Tailwind classes)
- Don't ignore accessibility requirements
- Don't commit untested code

### Code Quality Tools

```bash
# Linting and formatting
npm run lint          # Check for linting issues
npm run lint:fix      # Fix auto-fixable issues
npm run format        # Format code with Prettier

# Type checking
npm run type-check    # TypeScript type checking

# Testing
npm run test          # Run test suite
npm run test:coverage # Run tests with coverage

# Build verification
npm run build         # Verify production build works
```
