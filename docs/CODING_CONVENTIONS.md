# Coding Conventions

This document outlines the coding standards and conventions for the Transactions App project.

## Table of Contents

- [General Principles](#general-principles)
- [TypeScript](#typescript)
- [React](#react)
- [Styling](#styling)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Comments and Documentation](#comments-and-documentation)
- [Error Handling](#error-handling)
- [Testing](#testing)

## General Principles

### 1. Code Quality

- Write clean, readable, and maintainable code
- Follow the DRY (Don't Repeat Yourself) principle
- Keep functions and components small and focused
- Use meaningful names for variables, functions, and components
- Prefer composition over inheritance
- **Keep files under 500 lines when possible** - Large files become difficult to maintain and understand
- **Extract functions into separate files** - Promote reusability and maintainability by breaking down complex logic
- **Make functions reusable** - Write generic, well-abstracted functions that can be used across the application

### 2. Code Consistency

- Use ESLint and Prettier for consistent formatting
- Run `npm run lint:fix` before committing code
- Follow the established patterns in the codebase

### 3. Performance

- Avoid premature optimization
- Use React.memo() for expensive components
- Implement lazy loading for routes and heavy components
- Optimize images and assets

## TypeScript

### 1. Type Definitions

```typescript
// ✅ Good: Use interfaces for object types
interface User {
  id: string
  email: string
  name?: string
}

// ✅ Good: Use type for unions and primitives
type Status = 'pending' | 'success' | 'error'
type ID = string | number

// ❌ Avoid: Using 'any' type
const data: any = fetchData() // Bad

// ✅ Good: Use specific types or unknown
const data: User = fetchData()
const data: unknown = fetchData() // If type is truly unknown
```

### 2. Type Inference

```typescript
// ✅ Good: Let TypeScript infer when obvious
const count = 5
const message = 'Hello'

// ✅ Good: Explicit types for function parameters and returns
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

### 3. Nullable Values

```typescript
// ✅ Good: Use optional chaining and nullish coalescing
const userName = user?.name ?? 'Guest'

// ✅ Good: Check for null/undefined explicitly when needed
if (user && user.email) {
  sendEmail(user.email)
}
```

### 4. Enums vs Union Types

```typescript
// ✅ Prefer union types for simple cases
type UserRole = 'admin' | 'user' | 'guest'

// ✅ Use enums for complex cases with methods
enum HttpStatus {
  OK = 200,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,
}
```

## React

### 1. Component Structure

```typescript
// ✅ Good: Functional components with clear prop types
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
};
```

### 2. Hooks Usage

```typescript
// ✅ Good: Extract complex logic into custom hooks
function useFormState(initialValues: FormValues) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})

  const handleChange = (field: string, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  return { values, errors, handleChange }
}

// ✅ Good: Use hooks at the top level
function MyComponent() {
  const { user } = useAuth()
  const [count, setCount] = useState(0)

  // Component logic
}
```

### 3. State Management

```typescript
// ✅ Good: Group related state
interface FormState {
  email: string
  password: string
  isSubmitting: boolean
  error: string | null
}

const [formState, setFormState] = useState<FormState>({
  email: '',
  password: '',
  isSubmitting: false,
  error: null,
})

// ✅ Good: Use functional updates for state that depends on previous state
setCount((prev) => prev + 1)
```

### 4. Event Handlers

```typescript
// ✅ Good: Type event handlers properly
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault()
  // Handle click
}

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value)
}
```

### 5. Conditional Rendering

```typescript
// ✅ Good: Use short-circuit evaluation for simple conditions
{isLoading && <Spinner />}

// ✅ Good: Use ternary for if-else
{isAuthenticated ? <Dashboard /> : <Login />}

// ✅ Good: Use early returns for complex conditions
if (!user) {
  return <Login />;
}

return <Dashboard user={user} />;
```

## Styling

### Mobile-First Design

- **This app is primarily used from smartphones** - Always design and test with mobile devices in mind
- Use responsive design patterns that work well on small screens
- Ensure touch targets are large enough (minimum 44x44 pixels)
- Test on actual devices when possible

### DaisyUI Framework

**This project uses DaisyUI for UI components:**

- **Always use DaisyUI components and classes** instead of building from scratch with Tailwind utilities
- Refer to [DaisyUI Components](https://daisyui.com/components/) documentation
- DaisyUI provides pre-styled, accessible components that follow our design system
- Only add custom Tailwind utilities when DaisyUI doesn't provide the specific styling needed

```typescript
// ✅ Good: Use DaisyUI components
<div className="dock">
  <div className="dock-content">
    <button className="btn btn-circle btn-ghost">
      <HomeIcon className="h-6 w-6" />
    </button>
  </div>
</div>

<div className="card">
  <div className="card-body">
    <h2 className="card-title">Card Title</h2>
    <p>Card content</p>
  </div>
</div>

// ❌ Bad: Recreating DaisyUI components with utilities
<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
  <div className="bg-base-100 border rounded-full shadow-2xl px-4 py-3 flex gap-2">
    {/* Don't do this - use DaisyUI dock instead */}
  </div>
</div>
```

### 1. Icons

**Always use MUI Icons (Material-UI):**

- **Use MUI Icons** for all icons in the app
- Choose appropriate icons from `@mui/icons-material`
- Provides a consistent, modern icon set with excellent React support
- Already installed as part of `@mui/material` dependencies

```typescript
// ✅ Good: Import and use MUI icons
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

<button className="btn btn-soft-primary">
  <AddIcon fontSize="small" />
  Add Transaction
</button>

// ✅ Good: Use fontSize prop for different sizes
import DeleteIcon from '@mui/icons-material/Delete';

<button className="btn btn-soft-error btn-sm">
  <DeleteIcon fontSize="small" />
</button>

// ✅ Good: Use fontSize="inherit" or custom styles for tiny elements
import CheckIcon from '@mui/icons-material/Check';

<span className="badge badge-success">
  <CheckIcon sx={{ fontSize: 16 }} />
  Verified
</span>

// ❌ Bad: Don't use outlined versions unless specifically needed for design
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'; // Use filled icons
```

### 2. DaisyUI Components

**Button Styling:**

- **Use soft buttons** (`btn-soft-*`) for a modern, mobile-friendly appearance
- Soft buttons provide better visual feedback on mobile devices
- **All save buttons must use `SaveIcon` and `btn-primary` color**

```typescript
// ✅ Good: Save button with save icon and primary color
import SaveIcon from '@mui/icons-material/Save';

<button className="btn btn-primary" onClick={handleSave}>
  <SaveIcon fontSize="small" />
  Save Changes
</button>

// ✅ Good: Save button with loading state
<button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
  {isSaving ? (
    <>
      <span className="loading loading-spinner loading-sm"></span>
      Saving...
    </>
  ) : (
    <>
      <CircleStackIcon className="h-5 w-5" />
      Save Changes
    </>
  )}
</button>

// ✅ Good: Use DaisyUI soft buttons for other primary actions
<button className="btn btn-soft-primary">Submit</button>
<button className="btn btn-soft-secondary">Cancel</button>
<button className="btn btn-soft-accent">Add Transaction</button>

// ✅ Good: Combine with other utilities as needed
<button className="btn btn-soft-primary w-full">Full Width Button</button>
<button className="btn btn-soft-error btn-sm">Delete</button>
```

### 2. Tailwind CSS

```typescript
// ✅ Good: Use Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
  <h2 className="text-2xl font-bold">Title</h2>
</div>

// ✅ Good: Combine utilities effectively
<div className="card w-full max-w-md bg-base-200 shadow-xl">
  <div className="card-body">
    {/* Content */}
  </div>
</div>
```

### 3. Dynamic Styles

```typescript
// ✅ Good: Use template literals for dynamic classes with soft buttons
const buttonClass = `btn btn-soft-${variant}`;

// ✅ Good: Use conditional classes
<div className={`card ${isActive ? 'border-primary' : 'border-base-300'}`}>
```

## File Organization

### 1. Project Structure

**Maintain a logical folder structure** to clearly distinguish between different parts of the application:

```
docs/                   # All project documentation
├── CODING_CONVENTIONS.md
├── QUICKSTART.md
└── [other-docs].md
src/
├── components/
│   ├── common/         # Reusable UI components (buttons, inputs, etc.)
│   ├── layout/         # Layout components (header, footer, sidebar)
│   └── [feature]/      # Page-specific components grouped by feature
├── pages/              # Page components (one per route)
├── hooks/              # Custom React hooks
├── lib/                # Third-party library configs
├── styles/             # Global styles
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Root component
README.md               # Project overview (root level only)
```

**Documentation Guidelines:**

- **All documentation files must be placed in the `docs/` folder**
- Only `README.md` should remain at the root level for GitHub/repository overview
- Keep documentation organized and up-to-date
- Use clear, descriptive filenames for documentation

**Component Organization:**

- **Pages** go in `src/pages/` - These are route-level components
- **Reusable components** go in `src/components/common/` or `src/components/layout/`
- **Page-specific components** go in `src/components/[pageName]/` - Components used by only one page

Example:

```
src/
├── pages/
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   └── Login.tsx
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   └── RecentActivity.tsx
│   └── transactions/
│       ├── TransactionList.tsx
│       └── TransactionFilter.tsx
```

### 2. Component Files

```typescript
// ComponentName.tsx
import { useState } from 'react';
import type { Props } from './types';

// 1. Type definitions (if not in separate file)
interface ComponentNameProps {
  // ...
}

// 2. Main component
export const ComponentName = ({ prop1, prop2 }: ComponentNameProps) => {
  // 3. Hooks
  const [state, setState] = useState();

  // 4. Event handlers
  const handleClick = () => {
    // ...
  };

  // 5. Render helpers (if needed)
  const renderItem = (item: Item) => {
    // ...
  };

  // 6. Early returns
  if (loading) return <Spinner />;

  // 7. Main render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

## Naming Conventions

### 1. Files

```
// Components (PascalCase)
LoginForm.tsx
UserProfile.tsx

// Hooks (camelCase with 'use' prefix)
useAuth.ts
useFormValidation.ts

// Utilities (camelCase)
formatDate.ts
apiHelpers.ts

// Types (camelCase with '.types' suffix)
auth.types.ts
user.types.ts

// Constants (UPPER_SNAKE_CASE)
API_ENDPOINTS.ts
```

### 2. Variables and Functions

```typescript
// ✅ Good: camelCase for variables and functions
const userName = 'John'
const isActive = true

function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// ✅ Good: UPPER_SNAKE_CASE for constants
const MAX_RETRY_COUNT = 3
const API_BASE_URL = 'https://api.example.com'
```

### 3. Components

```typescript
// ✅ Good: PascalCase for components
export const UserProfile = () => {
  /* ... */
}
export const LoginForm = () => {
  /* ... */
}

// ✅ Good: Descriptive component names
export const TransactionList = () => {
  /* ... */
}
export const TransactionListItem = () => {
  /* ... */
}
```

### 4. Interfaces and Types

```typescript
// ✅ Good: PascalCase without 'I' prefix
interface User {
  id: string
  name: string
}

type UserRole = 'admin' | 'user'

// ✅ Good: Use descriptive names
interface LoginCredentials {
  email: string
  password: string
}
```

## Comments and Documentation

### 1. When to Comment

```typescript
// ✅ Good: Explain WHY, not WHAT
// Calculate discount only for premium users
if (user.isPremium) {
  discount = calculatePremiumDiscount(total)
}

// ❌ Bad: Obvious comments
// Set count to 0
setCount(0)
```

### 2. JSDoc Comments

```typescript
/**
 * Calculates the total price including tax and discount
 * @param items - Array of items in the cart
 * @param taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
 * @param discountCode - Optional discount code
 * @returns Total price after tax and discount
 */
function calculateTotal(items: Item[], taxRate: number, discountCode?: string): number {
  // Implementation
}
```

### 3. TODO Comments

```typescript
// TODO: Add validation for email format
// FIXME: This causes a memory leak
// NOTE: This is a temporary solution until API is updated
```

## Error Handling

### 1. Try-Catch Blocks

```typescript
// ✅ Good: Handle errors explicitly
const fetchUserData = async (userId: string) => {
  try {
    const response = await apiClient.get(`/users/${userId}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to fetch user:', error.message)
    }
    throw error
  }
}
```

### 2. Error Boundaries

```typescript
// ✅ Good: Use error boundaries for React errors
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### 3. User-Friendly Error Messages

```typescript
// ✅ Good: Show meaningful error messages to users
catch (error) {
  if (error.response?.status === 404) {
    setError('User not found');
  } else if (error.response?.status === 401) {
    setError('Please log in to continue');
  } else {
    setError('An unexpected error occurred. Please try again.');
  }
}
```

## Testing

### 1. Test File Naming

```
// Component tests
LoginForm.test.tsx
UserProfile.test.tsx

// Hook tests
useAuth.test.ts
useFormValidation.test.ts

// Utility tests
formatDate.test.ts
```

### 2. Test Structure

```typescript
describe('LoginForm', () => {
  it('should render email and password inputs', () => {
    // Arrange
    render(<LoginForm onSubmit={mockSubmit} />);

    // Act
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Assert
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it('should call onSubmit with correct credentials', async () => {
    // Test implementation
  });
});
```

### 3. Test Coverage

- Aim for high test coverage, especially for critical paths
- Test edge cases and error scenarios
- Test user interactions and expected outcomes

## Additional Guidelines

### 1. Development Environment

**Local Server Configuration:**

- This project uses an Apache webserver with PHP on `localhost:80`
- **Never run your own PHP server** (e.g., `php -S`) or similar dev servers for PHP
- The frontend development server (Vite) runs on a different port and proxies API requests to Apache
- Ensure Apache is running before starting development

**Backend API & CORS:**

- Backend PHP files are located in the `backend/` folder
- **Always include CORS handling** in API endpoints to allow cross-origin requests from the Vite dev server
- Use the `backend/cors.php` file for CORS configuration

```php
<?php
// ✅ Good: Include CORS at the top of all API endpoints
require_once 'cors.php';
cors();

// Your API code here
header('Content-Type: application/json');

$response = [
    'success' => true,
    'data' => []
];

echo json_encode($response);
```

### 2. Imports

```typescript
// ✅ Good: Group and order imports
// 1. React and third-party libraries
import { useState, useEffect } from 'react'
import axios from 'axios'

// 2. Internal modules
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/axios'

// 3. Components
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'

// 4. Types
import type { User, AuthState } from '@/types/auth.types'

// 5. Styles
import './styles.css'
```

### 2. Exports

```typescript
// ✅ Good: Named exports for components
export const LoginForm = () => {
  /* ... */
}

// ✅ Good: Default export for pages/main component
export default function HomePage() {
  /* ... */
}
```

### 3. Code Reviews

- Review PRs for code quality and adherence to conventions
- Provide constructive feedback
- Ask questions when something is unclear
- Approve when code meets standards

### 4. Git Workflow

- Create feature branches from main
- Use descriptive branch names (e.g., `feature/add-login`, `fix/authentication-bug`)
- Write clear commit messages
- Squash commits before merging

## Enforcement

These conventions are enforced through:

- ESLint configuration (`.eslintrc.cjs`)
- Prettier configuration (`.prettierrc.json`)
- TypeScript compiler (`tsconfig.json`)
- Code reviews
- CI/CD pipelines (when configured)

Run these commands regularly:

```bash
npm run lint        # Check for linting errors
npm run lint:fix    # Fix linting errors automatically
npm run format      # Format code with Prettier
npm run build       # Ensure code builds successfully
```

## Questions?

If you have questions about these conventions or suggestions for improvements, please:

1. Open an issue in the repository
2. Discuss with the team
3. Update this document with agreed-upon changes
