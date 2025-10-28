# UI Rules and Standards

This document outlines the UI/UX rules and design standards for the Transactions App.

## Button Standards

### Save Buttons

All save buttons throughout the application must follow these standards:

- **Icon**: Use `CircleStackIcon` from `@heroicons/react/24/solid`
- **Color**: Primary color variant (`btn-primary`)
- **Placement**: Icon appears before the button text
- **Size**: Icon should be `h-5 w-5`

**Example:**

```tsx
import { CircleStackIcon } from '@heroicons/react/24/solid'
;<button className="btn btn-primary" onClick={handleSave}>
  <CircleStackIcon className="h-5 w-5" />
  Save Changes
</button>
```

### Loading State for Save Buttons

When a save operation is in progress:

- Replace icon with a loading spinner
- Keep the same size (`loading-sm`)
- Display appropriate loading text

**Example:**

```tsx
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
```

## Icon Standards

All icons in the application should follow the coding conventions outlined in `CODING_CONVENTIONS.md`:

- Use Heroicons solid variants only
- Use 24px (h-6 w-6) for primary actions
- Use 20px mini (h-5 w-5) for secondary elements and button icons
- Use 16px micro (h-4 w-4) for inline text icons

## Color Standards

### Button Colors

- **Primary Actions**: `btn-primary` (saves, confirmations, main CTAs)
- **Secondary Actions**: `btn-soft-secondary` or `btn-secondary`
- **Cancel/Dismiss**: `btn-soft-ghost` or `btn-ghost`
- **Destructive Actions**: `btn-error`

### Theme

The application uses DaisyUI's **Emerald** theme (light mode only).

## Mobile-First Design

All UI components should be designed mobile-first:

- Touch-friendly button sizes (minimum 44x44px)
- Adequate spacing between interactive elements
- Responsive layouts that work on small screens
- Bottom navigation (Dock) for primary navigation
