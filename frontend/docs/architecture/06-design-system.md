# 06 — Design System

## Design Tokens

VoiceGateway uses a **token-driven design system** where every visual property is defined as a reusable token. Components reference tokens; they never hardcode values.

Token files live in `src/theme/`:

| File | Tokens |
|---|---|
| `colors.ts` | Brand palette, semantic colors, surface tokens (CSS variable references) |
| `typography.ts` | Font families, type scale presets, font weights |
| `spacing.ts` | 4px-based spacing scale (0–96) |
| `radius.ts` | Border radius tokens (sm/md/lg/xl/2xl/full) |
| `shadows.ts` | Elevation levels (surface/card/dropdown/popover/modal/floating) |
| `animations.ts` | Duration, easing, transition presets |
| `breakpoints.ts` | Responsive breakpoints (sm/md/lg/xl/2xl) |
| `z-index.ts` | Stacking order layers |
| `layout.ts` | Fixed layout dimensions (sidebar, header, input heights) |
| `tokens.ts` | Aggregate — the design language reference |

### Palette System

```typescript
// Brand (Indigo) — Primary identity
brand: { 50, 100, ..., 950 }  // oklch(0.97 0.01 264) → oklch(0.12 0.04 264)

// Neutral (Cool Gray) — Text, borders, backgrounds
neutral: { 50, 100, ..., 950 }

// Semantic — States
success: { 50 → 900 }   // Green
warning: { 50 → 900 }   // Amber
error: { 50 → 900 }     // Red
info: { 50 → 900 }      // Blue
```

All colors are defined in **oklch** color space for perceptual uniformity.

### Semantic Surface Tokens

Surface tokens reference **CSS custom properties** so they change with theme:

```typescript
export const colors = {
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  primary: 'var(--primary)',
  primaryForeground: 'var(--primary-foreground)',
  muted: 'var(--muted)',
  mutedForeground: 'var(--muted-foreground)',
  border: 'var(--border)',
  // ... sidebar, semantic states
};
```

CSS variables are defined in `globals.css` and switch values in `.dark`/light mode contexts. Tailwind v4 maps these via `@theme`:

```css
@theme {
  --color-background: var(--background);
  --color-primary: var(--primary);
  --color-muted-foreground: var(--muted-foreground);
  /* ... */
}
```

## Typography

### Font Families

| Family | Usage | Stack |
|---|---|---|
| **Inter** | Body, headings, UI | `'Inter', 'system-ui', 'sans-serif'` |
| **JetBrains Mono** | Code, monospace | `'JetBrains Mono', 'Fira Code', 'monospace'` |

### Type Scale

| Preset | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `display` | 48px (3rem) | 1.1 | 700 | Landing page hero |
| `h1` | 36px (2.25rem) | 1.2 | 700 | Page titles |
| `h2` | 30px (1.875rem) | 1.3 | 600 | Section headings |
| `h3` | 24px (1.5rem) | 1.4 | 600 | Card headings |
| `h4` | 20px (1.25rem) | 1.4 | 600 | Sub-section headings |
| `body-lg` | 18px (1.125rem) | 1.6 | 400 | Large body text |
| `body` | 16px (1rem) | 1.6 | 400 | Default body text |
| `body-sm` | 14px (0.875rem) | 1.5 | 400 | Secondary text |
| `small` | 12px (0.75rem) | 1.5 | 400 | Captions |
| `caption` | 12px (0.75rem) | 1.4 | 400 | Figure captions |
| `label` | 14px (0.875rem) | 1.5 | 500 | Form labels |
| `label-uppercase` | 11px (0.6875rem) | 1.2 | 600 | Section category labels |
| `code` | 14px (0.875rem) | 1.5 | 400 | Inline code |

### Typography Components

| Component | Element | Props |
|---|---|---|
| `<Text>` | `<p>` (or custom via `as`) | `size`, `weight`, `color`, `align` |
| `<Heading>` | `<h1>`–`<h6>` | `level` (1–6), `weight`, `color` |
| `<Caption>` | `<span>` | `size`, `weight`, `color` |
| `<Code>` | `<code>` | Standard HTML |
| `<Link>` | `<a>` (or Next.js Link) | `variant`, `underline`, `external` |

## Spacing

Base unit: **0.25rem (4px)**. All spacing uses this 4px grid.

```typescript
spacing: {
  0: '0px',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  2: '0.5rem',       // 8px
  ...
  4: '1rem',         // 16px (default gap)
  ...
  12: '3rem',        // 48px
  16: '4rem',        // 64px
  ...
  96: '24rem',       // 384px
}
```

Layout components use these tokens for padding, gaps, and margins.

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `sm` | `calc(var(--radius) - 4px)` | Inputs, small elements |
| `md` | `var(--radius)` [8px default] | Cards, sections, buttons |
| `lg` | `calc(var(--radius) + 4px)` | Modals, side panels |
| `xl` | `1rem` (16px) | Large containers |
| `2xl` | `1.5rem` (24px) | Hero sections |
| `full` | `9999px` | Avatars, pills |

## Elevation (Shadows)

| Level | Purpose | Shadow |
|---|---|---|
| `surface` | Default — no elevation | `none` |
| `card` | Subtle card | `0 1px 3px...` |
| `dropdown` | Dropdown menus | `0 4px 6px...` |
| `popover` | Tooltips, datepickers | `0 10px 15px...` |
| `modal` | Dialogs, side panels | `0 20px 25px...` |
| `floating` | FAB, notifications | `0 25px 50px...` |

## Animations

### Duration

| Token | Value | Use Case |
|---|---|---|
| `instant` | 75ms | Micro-interactions |
| `fast` | 150ms | Hover, active states |
| `normal` | 200ms | Default transitions |
| `slow` | 300ms | Panel slide, enter/exit |
| `slower` | 500ms | Page transitions |

### Easing

| Token | Curve |
|---|---|
| `default` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `in` | `cubic-bezier(0.4, 0, 1, 1)` |
| `out` | `cubic-bezier(0, 0, 0.2, 1)` |
| `spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

### CSS Animations

Defined in `globals.css`:
- `animate-in-fade` — fade in + slide up (page enters)
- `animate-loader-slide` — GlobalLoader indeterminate bar

## Z-Index Layers

| Token | Value |
|---|---|
| `hide` | -1 |
| `base` | 0 |
| `dropdown` | 100 |
| `sticky` | 200 |
| `banner` | 300 |
| `overlay` | 400 |
| `modal` | 500 |
| `popover` | 600 |
| `toast` | 700 |
| `tooltip` | 800 |

## Layout Components

### Page Structure

```
<PageContainer>           ← Responsive horizontal padding
  <ContentContainer>      ← Max-width 80rem centered
    <PageHeader>          ← Title + description + actions
    <Section>             ← Card-like content block
      <SectionHeader>     ← Section title + description + actions
      <SectionContent>    ← Section body
      <EmptyState>        ← Empty data state
    </Section>
    <Grid cols={1} md={2}> ← Responsive grid
      <Panel title="..."> ← Composed card with header
      </Panel>
    </Grid>
  </ContentContainer>
</PageContainer>
```

### Responsive Principles

- **Mobile-first:** Default styles target small screens, breakpoint utilities add larger screens
- **Breakpoints:** sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
- **Layout components accept responsive props:** `<Grid cols={1} md={2} lg={3}>`
- **Page padding:** px-4 (mobile) → sm:px-6 → lg:px-8

## UI Components

### Classification

| Category | Components | Rule |
|---|---|---|
| **Typography** | Text, Heading, Caption, Code, Link | No margin/padding, only type styling |
| **Form** | Form, FormField, Input, Select, Checkbox, Switch, RadioGroup, Textarea | Uncontrolled by default, controlled via props |
| **Feedback** | Alert, Notice, Banner, Toast, LoadingState, ErrorState, SuccessState, EmptyState | Semantic color mapping |
| **Overlay** | Dialog, ConfirmDialog, Sheet, Popover, Tooltip, DropdownMenu, Command | Portal-based, focus-trapped |
| **Data Display** | Badge, StatusBadge, Card, Table, DataTable, Pagination, ProgressRing, Progress, Skeleton | Read-only rendering |
| **Utility** | Button, Separator, ScrollArea, Avatar, Surface, Panel, Toolbar, ActionGroup, IconContainer, Tabs, Breadcrumb | Building blocks |

### Base UI Integration

Buttons, Dialogs, Menus, Popovers, Tooltips, and Selects use **@base-ui/react** as their headless primitive. This provides:
- Accessibility (ARIA, keyboard navigation, focus management)
- Behavioral correctness (click outside, escape, scroll lock)
- Zero styling (we add our own via CVA + Tailwind)

```typescript
// Example: Button wraps @base-ui/react Button
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';

const buttonVariants = cva('inline-flex items-center ...', {
  variants: {
    variant: { default: 'bg-primary ...', outline: '...' },
    size: { default: 'h-8 ...', sm: 'h-7 ...' },
  },
});

function Button({ className, variant, size, ...props }: ButtonPrimitive.Props & VariantProps<...>) {
  return <ButtonPrimitive className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
```

### Component Composition Rules

1. **Children over props:** If a component needs custom content, accept `children` rather than adding configuration props
2. **Semantic elements:** Use the `as` prop for semantic HTML (section/article/nav) when appropriate
3. **Spread props:** Accept and spread native HTML props for flexibility
4. **cn() for classes:** All class merging goes through `cn()` (clsx + tailwind-merge)
5. **No hardcoded values:** Colors, spacing, radius — never hardcode; use CSS variables or theme tokens
6. **One component per file:** One default export, named export for the component
7. **Props interface:** Named interface (exported), extends native component props where appropriate

## Accessibility

- All interactive components use @base-ui/react primitives which provide ARIA attributes
- Color contrast ratios meet WCAG AA standards (dark and light mode)
- Focus indicators via Tailwind `focus-visible:ring-*`
- Reduced motion respected via Tailwind's `motion-reduce:` variant
- Keyboard navigation supported for all interactive elements

## Creating New Components

### Checklist

1. Define the component in `src/components/ui/` (UI) or `src/components/layout/` (layout)
2. Export an `interface {ComponentName}Props` with the public API
3. Use `cn()` for class merging — never raw class strings
4. Reference CSS variables for colors (`var(--primary)`) — never hardcoded hex
5. Support dark mode via theme-relative classes (`bg-card`, `text-muted-foreground`)
6. Add JSDoc comment explaining the component's purpose and usage
7. Export from the barrel index file
8. Test in both light and dark mode

### File Template

```typescript
'use client';

import { cn } from '@/lib/utils';
import type React from 'react';

export interface MyComponentProps extends React.ComponentProps<'div'> {
  /** Description of this prop */
  title?: string;
}

/**
 * MyComponent
 *
 * Brief description of what this component does.
 */
function MyComponent({
  className,
  title,
  children,
  ...props
}: MyComponentProps) {
  return (
    <div className={cn('bg-card text-card-foreground rounded-lg', className)} {...props}>
      {title && <h3 className="text-base font-semibold">{title}</h3>}
      {children}
    </div>
  );
}

export { MyComponent };
```
