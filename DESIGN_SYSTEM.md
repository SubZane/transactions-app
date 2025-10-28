# Design System & Guidelines

## Overview

A clean, professional design system for the Transactions App using DaisyUI's Emerald theme with Swedish kronor (SEK) currency.

## Core Principles

1. **Clarity First** - Information should be easy to scan and understand
2. **Minimal Shadows** - Use subtle elevation only when necessary
3. **Purposeful Color** - Colors indicate meaning (success/error/info), not decoration
4. **Consistent Spacing** - Follow a predictable rhythm throughout the app
5. **Subtle Gradients** - Use very subtle gradients (e.g., from-primary/10 to-primary/5) for visual interest, never vibrant or distracting

## Color Usage

### Theme Colors (DaisyUI Emerald)

- **Primary** (`primary`) - Main actions, CTAs, focus states
- **Secondary** (`secondary`) - Supporting elements
- **Accent** (`accent`) - Highlights, special features
- **Success** (`success`) - Positive actions, deposits, income, confirmations
- **Error** (`error`) - Destructive actions, expenses, warnings, errors
- **Info** (`info`) - Informational messages, neutral states
- **Warning** (`warning`) - Cautionary messages

### Semantic Color Application

```
Deposits/Income:
- Text: text-success
- Badges: badge-success
- Borders: border-success
- Backgrounds: bg-success/5 or bg-success/10 (subtle)

Expenses:
- Text: text-error
- Badges: badge-error
- Borders: border-error
- Backgrounds: bg-error/5 or bg-error/10 (subtle)

Neutral Elements:
- Cards: bg-base-100 or bg-base-200
- Borders: border-base-300
- Text: text-base-content
- Muted text: text-base-content/60 or text-base-content/70
```

## Elevation & Shadows

### Shadow Scale

```scss
// Light elevation (default cards, hover states)
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

### When to Use Shadows

- ✅ Cards that contain actions or interactive content
- ✅ Dropdowns, modals, and overlays
- ✅ Floating action buttons
- ❌ Static content cards
- ❌ Form inputs (use borders instead)
- ❌ Badges and labels

## Spacing System

### Consistent Scale (Tailwind/DaisyUI)

```
Space: 0.25rem (1)
Small: 0.5rem  (2)
Base:  1rem    (4)
Med:   1.5rem  (6)
Large: 2rem    (8)
XL:    3rem    (12)
```

### Component Spacing

- **Card padding**: `p-4 md:p-6`
- **Section gaps**: `space-y-6` or `gap-6`
- **Form fields**: `space-y-4`
- **Button groups**: `gap-3`
- **List items**: `space-y-2`

## Typography

### Hierarchy

```
Page Title:    text-2xl font-bold
Section Title: text-xl font-semibold
Card Title:    text-lg font-semibold
Body:          text-base
Label:         text-sm font-medium
Caption:       text-xs text-base-content/70
```

### Font Weights

- **Normal**: 400 (default body text)
- **Medium**: 500 (labels, subtle emphasis)
- **Semibold**: 600 (headings, buttons)
- **Bold**: 700 (page titles, amounts)

## Components

### Cards

```tsx
// Default card (no shadow)
<div className="card bg-base-100 border border-base-300">
  <div className="card-body p-4 md:p-6">
    {/* content */}
  </div>
</div>

// Interactive card (light shadow)
<div className="card bg-base-100 border border-base-300 elevation-sm hover:elevation-md transition-shadow">
  <div className="card-body p-4 md:p-6">
    {/* content */}
  </div>
</div>
```

### Buttons

```tsx
// Primary action
<button className="btn btn-primary">Action</button>

// Secondary action
<button className="btn btn-outline">Cancel</button>

// Destructive action
<button className="btn btn-error">Delete</button>

// Icon button
<button className="btn btn-ghost btn-sm btn-circle">
  <Icon className="h-5 w-5" />
</button>
```

### Forms

```tsx
// Input field
<div className="form-control">
  <label className="label">
    <span className="label-text font-medium">Label</span>
  </label>
  <input
    type="text"
    className="input input-bordered"
    placeholder="Placeholder"
  />
  <label className="label">
    <span className="label-text-alt text-base-content/70">Helper text</span>
  </label>
</div>

// Radio buttons (for type selection)
<label className={`
  cursor-pointer border-2 rounded-lg p-4 transition-all
  ${selected ? 'border-primary bg-primary/10' : 'border-base-300'}
  hover:border-primary/50
`}>
  <input type="radio" className="radio" />
  <span className="font-semibold">Option</span>
</label>
```

### Badges

```tsx
// Status badges
<span className="badge badge-success">Deposit</span>
<span className="badge badge-error">Expense</span>
<span className="badge">Neutral</span>
```

### Transactions List

```tsx
<div className="card bg-base-100 border border-base-300">
  <div className="card-body p-4">
    <div className="flex items-center justify-between gap-4">
      {/* Left: Category info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold">{category}</h3>
        <p className="text-sm text-base-content/60">
          {date} • {user}
        </p>
      </div>

      {/* Right: Amount + actions */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-lg font-bold text-success">+1 234 kr</p>
          <span className="badge badge-sm badge-success">deposit</span>
        </div>
        <button className="btn btn-ghost btn-sm btn-circle">
          <Icon className="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</div>
```

### Summary Cards

```tsx
<div className="card bg-base-100 border border-base-300">
  <div className="card-body p-4">
    <h3 className="text-sm font-medium text-base-content/60">Label</h3>
    <p className="text-2xl font-bold text-success">1 234 kr</p>
  </div>
</div>
```

## Transitions

### Standard Transitions

```scss
// Default transition for interactive elements
.transition-default {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

// Shadow transitions
.transition-shadow {
  transition: box-shadow 150ms ease;
}

// Color transitions
.transition-colors {
  transition:
    color 150ms ease,
    background-color 150ms ease,
    border-color 150ms ease;
}
```

### Hover States

- Cards: Slight shadow increase
- Buttons: Color darkening (handled by DaisyUI)
- Links: Opacity change to 0.8
- Icon buttons: Background color change

## Layout

### Page Structure

```tsx
<div className="min-h-screen bg-base-100 pb-24">
  <Header />
  <main className="max-w-7xl mx-auto px-4 py-6">{/* Page content */}</main>
  <Dock />
</div>
```

### Grid Systems

```tsx
// Summary cards (responsive grid)
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Card />
  <Card />
  <Card />
</div>

// Two-column forms
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <FormField />
  <FormField />
</div>
```

## Responsive Design

### Breakpoints (Tailwind)

- `sm`: 640px
- `md`: 768px (primary breakpoint)
- `lg`: 1024px
- `xl`: 1280px

### Mobile-First Approach

- Default styles for mobile
- Use `md:` prefix for tablet/desktop adjustments
- Increase padding/spacing on larger screens
- Stack on mobile, grid on desktop

## Accessibility

### Focus States

- All interactive elements must have visible focus states
- Use DaisyUI's built-in focus rings
- Never remove focus outlines without replacement

### Color Contrast

- Ensure WCAG AA compliance (4.5:1 for normal text)
- Use `text-base-content/60` minimum for readable text
- Never use color alone to convey information

### Interactive Elements

- Minimum touch target: 44x44px
- Clear hover states
- Descriptive aria-labels for icon buttons

## Currency Formatting

### Swedish Kronor (SEK)

```typescript
// Format: "1 234 kr" (no decimals, space separators)
new Intl.NumberFormat('sv-SE', {
  style: 'currency',
  currency: 'SEK',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format(amount)

// In forms: suffix "kr" after input
<input type="number" step="1" min="1" />
<span>kr</span>
```

## Do's and Don'ts

### ✅ Do

- Use semantic color meanings (green = positive, red = negative)
- Keep consistent spacing between components
- Use border for card separation instead of heavy shadows
- Maintain clear visual hierarchy
- Use subtle backgrounds (bg-opacity-10) for type differentiation

### ❌ Don't

- Use gradients anywhere
- Add unnecessary shadows
- Use colors decoratively (every color should have meaning)
- Create custom colors outside DaisyUI theme
- Mix different border radiuses (stick to DaisyUI defaults)
- Use hard-coded colors (always use theme variables)

## SCSS Usage

### When to Use SCSS

- Complex hover state combinations
- Reusable elevation/shadow mixins
- Custom animations
- Component-specific utilities not in Tailwind

### File Structure

```
src/styles/
  ├── index.css          # Main entry, Tailwind imports
  ├── _variables.scss    # Theme customizations
  ├── _mixins.scss       # Reusable mixins
  └── _utilities.scss    # Custom utility classes
```

## Implementation Notes

1. **Consistency**: All components should follow these guidelines
2. **DaisyUI First**: Always check if DaisyUI has a component before custom styling
3. **Tailwind Utilities**: Prefer Tailwind classes over custom CSS
4. **SCSS for Complex**: Use SCSS only when Tailwind becomes cumbersome
5. **Document Changes**: Update this guide when adding new patterns
