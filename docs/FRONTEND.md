# Frontend Architecture & Design System

## Overview

The Transactions App frontend is built with React 19, TypeScript, and Tailwind CSS using DaisyUI's Emerald theme. This document covers the complete frontend architecture, component patterns, design system, and implementation guidelines.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Routing & Navigation](#routing--navigation)
- [Performance Optimization](#performance-optimization)
- [UI Guidelines](#ui-guidelines)

## Technology Stack

### Core Technologies

- **React 19** - UI library with latest features
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS 4** - Utility-first CSS framework
- **DaisyUI 5** - Component library with Emerald theme

### Supporting Libraries

- **MUI Icons** - Material-UI icon library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Supabase** - Authentication client
- **React Hook Form** - Form state management

### Development Tools

- **ESLint 9** - Code linting with modern configuration
- **Prettier** - Code formatting
- **TypeScript 5** - Latest TypeScript features

## Project Structure

```
src/
├── components/              # React components
│   ├── common/             # Shared/reusable components
│   │   ├── Alert.tsx       # Alert/notification component
│   │   └── Dock.tsx        # Navigation dock
│   ├── features/           # Feature-specific components
│   │   └── TransactionList.tsx
│   ├── layout/             # Layout components
│   │   └── Header.tsx      # App header
│   └── ui/                 # Pure UI components
│       └── LoginForm.tsx   # Login form component
├── hooks/                  # Custom React hooks
│   └── useAuth.ts         # Authentication hook
├── lib/                    # Third-party configurations
│   ├── axios.ts           # Axios configuration
│   └── supabase.ts        # Supabase client setup
├── pages/                  # Page components
│   ├── AddTransactionPage.tsx
│   ├── EditTransactionPage.tsx
│   ├── ProfilePage.tsx
│   └── TransactionsPage.tsx
├── services/               # API service layers
│   ├── api.service.ts     # Base API client
│   ├── category.service.ts
│   ├── transaction.service.ts
│   └── user.service.ts
├── styles/                 # Styling
│   ├── _mixins.scss       # SCSS mixins
│   ├── _utilities.scss    # Custom utilities
│   └── index.css          # Main styles
├── types/                  # TypeScript type definitions
│   └── auth.types.ts      # Authentication types
├── utils/                  # Utility functions
│   └── formatters.ts      # Data formatting helpers
├── App.tsx                 # Main app component
└── main.tsx               # Application entry point
```

## Design System

### Core Principles

1. **Clarity First** - Information should be easy to scan and understand
2. **Minimal Shadows** - Use subtle elevation only when necessary
3. **Purposeful Color** - Colors indicate meaning (success/error/info), not decoration
4. **Consistent Spacing** - Follow a predictable rhythm throughout the app
5. **Subtle Gradients** - Use very subtle gradients for visual interest, never vibrant

### Color System (DaisyUI Emerald Theme)

#### Theme Colors

- **Primary** (`primary`) - Main actions, CTAs, focus states
- **Secondary** (`secondary`) - Supporting elements
- **Accent** (`accent`) - Highlights, special features
- **Success** (`success`) - Positive actions, deposits, income
- **Error** (`error`) - Destructive actions, expenses, warnings
- **Info** (`info`) - Informational messages, neutral states
- **Warning** (`warning`) - Cautionary messages

#### Semantic Color Application

```tsx
// Deposits/Income
<span className="text-success">+1,250 SEK</span>
<div className="badge badge-success">Deposit</div>
<div className="bg-success/5 border-success">Deposit card</div>

// Expenses
<span className="text-error">-850 SEK</span>
<div className="badge badge-error">Expense</div>
<div className="bg-error/5 border-error">Expense card</div>

// Neutral Elements
<div className="bg-base-100 border-base-300">Card</div>
<span className="text-base-content/70">Muted text</span>
```

### Elevation & Shadows

#### Shadow Scale

```scss
// Light elevation (interactive cards, hover states)
.elevation-sm {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

// Medium elevation (modals, dropdowns)
.elevation-md {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

// No shadow for most elements
.elevation-none {
  box-shadow: none;
}
```

#### When to Use Shadows

- ✅ Cards with interactive content
- ✅ Dropdowns, modals, overlays
- ✅ Floating action buttons
- ❌ Static content cards
- ❌ Form inputs (use borders)
- ❌ Badges and labels

### Spacing System

#### Consistent Scale (Tailwind)

```
Space: 0.25rem (1)    Small: 0.5rem (2)
Base:  1rem (4)       Med:   1.5rem (6)
Large: 2rem (8)       XL:    3rem (12)
```

#### Component Spacing

```tsx
// Card padding
<div className="p-4 md:p-6">

// Section gaps
<div className="space-y-6">

// Form fields
<div className="space-y-4">

// Button groups
<div className="gap-3">
```

### Typography

#### Font Hierarchy

```css
/* Headings */
.heading-xl {
  @apply text-3xl font-bold tracking-tight;
}
.heading-lg {
  @apply text-2xl font-bold tracking-tight;
}
.heading-md {
  @apply text-xl font-semibold;
}
.heading-sm {
  @apply text-lg font-semibold;
}

/* Body text */
.text-body {
  @apply text-base leading-relaxed;
}
.text-small {
  @apply text-sm;
}
.text-xs {
  @apply text-xs;
}

/* Special */
.text-muted {
  @apply text-base-content/70;
}
.text-subtle {
  @apply text-base-content/60;
}
```

## Component Architecture

### Component Organization

Components are organized by purpose:

- **`common/`** - Shared components used across features
- **`features/`** - Feature-specific components with business logic
- **`layout/`** - Layout and navigation components
- **`ui/`** - Pure UI components without business logic

### Component Patterns

#### Basic Component Structure

```tsx
import { FC } from 'react'

interface ComponentProps {
  title: string
  isLoading?: boolean
  onAction?: () => void
}

export const Component: FC<ComponentProps> = ({ title, isLoading = false, onAction }) => {
  return (
    <div className="component-wrapper">
      <h2 className="heading-md">{title}</h2>
      {isLoading ? (
        <div className="loading loading-spinner" />
      ) : (
        <button onClick={onAction} className="btn btn-primary">
          Action
        </button>
      )}
    </div>
  )
}
```

#### Memoized Components

For performance-critical components:

```tsx
import { memo, useMemo, useCallback } from 'react'

export const TransactionList = memo(({ transactions, searchQuery }) => {
  // Memoize expensive computations
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) =>
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [transactions, searchQuery])

  // Memoize event handlers
  const handleEdit = useCallback(
    (id: number) => {
      navigate(`/edit/${id}`)
    },
    [navigate]
  )

  return (
    <div className="transaction-list">
      {filteredTransactions.map((transaction) => (
        <TransactionItem key={transaction.id} transaction={transaction} onEdit={handleEdit} />
      ))}
    </div>
  )
})
```

### Icon Integration

Using Material-UI icons consistently:

```tsx
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'

// Icon sizing
<EditIcon sx={{ fontSize: 16 }} />  // Small
<EditIcon sx={{ fontSize: 20 }} />  // Medium
<EditIcon sx={{ fontSize: 24 }} />  // Large

// With inherit sizing
<EditIcon sx={{ fontSize: 'inherit' }} />
```

## State Management

### Component State

Using React hooks for local state:

```tsx
const [isLoading, setIsLoading] = useState(false)
const [formData, setFormData] = useState({ amount: '', description: '' })
const [error, setError] = useState<string | null>(null)
```

### Form State

Using controlled components:

```tsx
const [amount, setAmount] = useState('')

const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value
  // Only allow numbers
  if (/^\d*$/.test(value)) {
    setAmount(value)
  }
}

;<input type="text" value={amount} onChange={handleAmountChange} className="input input-bordered" />
```

### API State

Using service layer for data fetching:

```tsx
const [transactions, setTransactions] = useState<Transaction[]>([])
const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const data = await transactionService.getAll()
      setTransactions(data)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  fetchTransactions()
}, [])
```

## Routing & Navigation

### Route Structure

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TransactionsPage />} />
        <Route path="/add" element={<AddTransactionPage />} />
        <Route path="/edit/:id" element={<EditTransactionPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### Navigation

Using programmatic navigation:

```tsx
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()

// Navigate to different pages
const handleAddTransaction = () => navigate('/add')
const handleEditTransaction = (id: number) => navigate(`/edit/${id}`)
const handleBack = () => navigate(-1)
```

## Performance Optimization

### Component Memoization

```tsx
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return transactions.reduce((sum, t) => sum + t.amount, 0)
}, [transactions])

// Memoize callbacks to prevent re-renders
const handleClick = useCallback(
  (id: number) => {
    onItemClick(id)
  },
  [onItemClick]
)

// Memoize components
const MemoizedList = memo(TransactionList)
```

### Image Optimization

```tsx
// Lazy loading images
<img src="/image.jpg" alt="Description" loading="lazy" className="w-full h-auto" />
```

### Bundle Optimization

```typescript
// Lazy load pages
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'))

// Use in router
<Suspense fallback={<div className="loading loading-spinner" />}>
  <TransactionsPage />
</Suspense>
```

## UI Guidelines

### Button Standards

#### Save Buttons

All save buttons must follow these standards:

```tsx
import SaveIcon from '@mui/icons-material/Save'

// Standard save button
<button className="btn btn-primary" onClick={handleSave}>
  <SaveIcon fontSize="small" />
  Save Changes
</button>

// Loading state
<button className="btn btn-primary" disabled={isSaving}>
  {isSaving ? (
    <>
      <span className="loading loading-spinner loading-sm" />
      Saving...
    </>
  ) : (
    <>
      <SaveIcon fontSize="small" />
      Save Changes
    </>
  )}
</button>
```

#### Button Variants

```tsx
// Primary actions
<button className="btn btn-primary">Primary Action</button>

// Secondary actions
<button className="btn btn-secondary">Secondary</button>

// Destructive actions
<button className="btn btn-error">Delete</button>

// Ghost buttons
<button className="btn btn-ghost">Cancel</button>
```

### Form Standards

#### Input Fields

```tsx
// Standard input
<input
  type="text"
  className="input input-bordered w-full"
  placeholder="Enter amount"
/>

// With validation state
<input
  className={`input input-bordered w-full ${
    error ? 'input-error' : ''
  }`}
/>

// Textarea
<textarea
  className="textarea textarea-bordered w-full"
  rows={3}
  placeholder="Description (optional)"
/>
```

#### Radio Button Groups

```tsx
<div className="grid grid-cols-2 gap-4">
  <label
    className={`cursor-pointer border-2 rounded-lg p-4 transition-colors ${
      type === 'expense' ? 'border-error bg-error/5' : 'border-base-300 hover:border-error/50'
    }`}>
    <input
      type="radio"
      value="expense"
      checked={type === 'expense'}
      onChange={(e) => setType(e.target.value)}
      className="radio radio-error sr-only"
    />
    <div className="text-center">
      <div className="text-2xl mb-2">💸</div>
      <div className="font-semibold">Expense</div>
    </div>
  </label>
</div>
```

### Loading States

#### Skeleton Loading

```tsx
// For content that's loading
<div className="animate-pulse">
  <div className="h-4 bg-base-300 rounded w-3/4 mb-2" />
  <div className="h-4 bg-base-300 rounded w-1/2" />
</div>
```

#### Spinner Loading

```tsx
// For actions in progress
<div className="flex justify-center items-center py-12">
  <div className="loading loading-spinner loading-lg text-primary" />
</div>
```

### Error Handling

#### Error Messages

```tsx
// Inline error
{
  error && <div className="text-error text-sm mt-1">{error}</div>
}

// Alert error
;<div className="alert alert-error">
  <AlertCircleIcon className="h-5 w-5" />
  <span>Something went wrong. Please try again.</span>
</div>
```

### Responsive Design

#### Mobile-First Approach

```tsx
// Stack on mobile, side-by-side on desktop
<div className="flex flex-col lg:flex-row gap-4">
  <div className="lg:w-1/2">Left content</div>
  <div className="lg:w-1/2">Right content</div>
</div>

// Hide on mobile, show on desktop
<div className="hidden lg:block">Desktop only content</div>

// Show on mobile, hide on desktop
<div className="lg:hidden">Mobile only content</div>
```

#### Responsive Typography

```tsx
// Responsive text sizes
<h1 className="text-2xl lg:text-4xl font-bold">
  Responsive Heading
</h1>

// Responsive spacing
<div className="p-4 lg:p-8">
  Responsive padding
</div>
```

### Accessibility

#### Semantic HTML

```tsx
// Use semantic elements
<main role="main">
  <article>
    <header>
      <h1>Page Title</h1>
    </header>
    <section>
      <h2>Section Title</h2>
      {/* content */}
    </section>
  </article>
</main>
```

#### ARIA Labels

```tsx
// Descriptive button labels
<button
  aria-label={`Edit ${transaction.description} transaction`}
  className="btn btn-ghost btn-sm"
>
  <EditIcon fontSize="small" />
</button>

// Form labels
<label htmlFor="amount" className="label">
  <span className="label-text">Amount (SEK)</span>
</label>
<input id="amount" type="text" className="input input-bordered" />
```

## Best Practices

### Performance

- Use `memo()` for expensive components
- Implement `useMemo()` for expensive calculations
- Use `useCallback()` for event handlers in memoized components
- Lazy load pages and non-critical components

### Maintainability

- Keep components under 200 lines when possible
- Extract custom hooks for reusable logic
- Use TypeScript interfaces for all props
- Follow consistent naming conventions

### User Experience

- Provide loading states for all async operations
- Show error messages clearly and actionably
- Implement optimistic updates where appropriate
- Ensure responsive design works on all screen sizes

### Code Quality

- Use ESLint and Prettier for consistent code style
- Write meaningful component and function names
- Add TypeScript types for all data structures
- Test components with realistic data
