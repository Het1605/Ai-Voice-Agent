# 03 — Frontend Architecture

## Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.10 | React framework, App Router |
| React | 19.2.4 | UI library |
| @base-ui/react | 1.6.0 | Headless UI primitives (Button, Dialog, Menu, Popover, Tooltip, Select) |
| @tanstack/react-query | 5.101.3 | Server state management |
| Zustand | 5.0.14 | Client state management |
| Tailwind CSS | 4 | Utility-first CSS framework |
| class-variance-authority | 0.7.1 | Component variant management |
| clsx + tailwind-merge | — | Class name merging via `cn()` |
| next-themes | 0.4.6 | Dark/light mode |
| Lucide React | 1.23.0 | Icon library |
| Axios | 1.18.1 | HTTP client |
| Zod | 4.4.3 | Runtime validation (env config) |
| TypeScript | 5.x | Type safety |

## Route Groups & Layouts

```
src/app/
├── layout.tsx              ← Root layout: <html>, <body>, GlobalLoader, Providers
├── page.tsx                ← Root page: redirect('/dashboard')
├── (auth)/
│   ├── layout.tsx          ← AuthLayout (centered card, no sidebar)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── forgot-password/page.tsx
├── (client)/
│   ├── layout.tsx          ← AppShellProvider + ShellSidebar + ShellHeader
│   ├── dashboard/page.tsx
│   ├── agents/...
│   ├── calls/...
│   ├── knowledge/...
│   ├── analytics/page.tsx
│   ├── team/page.tsx
│   ├── billing/page.tsx
│   ├── integrations/page.tsx
│   ├── settings/...
│   ├── profile/page.tsx
│   └── ... (future modules)
└── (admin)/
    ├── layout.tsx          ← RouteGuard + AdminLayout (header-only)
    ├── organizations/page.tsx
    └── users/page.tsx
```

### Root Layout (`app/layout.tsx`)

```
<html> → <body> → <GlobalLoader /> → <Providers>
```

The `Providers` wrapper composes:
1. `ReactQueryProvider` — QueryClient with 5min staleTime
2. `ThemeProvider` (next-themes) — dark mode by default, system toggle
3. `TooltipProvider` — 300ms delay
4. `AuthProvider` — Session restoration, login/logout/register context

### Client Layout (`(client)/layout.tsx`)

```
<AppShellProvider>          ← Navigation context, sidebar state, extensions
  <div flex h-screen>
    <ShellSidebar />        ← Navigation groups, collapse toggle, extension slots
    <div flex flex-col flex-1>
      <ShellHeader />       ← Breadcrumbs, search, theme toggle, user menu, extension slots
      <main>                ← Page content (children)
      </main>
    </div>
  </div>
</AppShellProvider>
```

### Auth Layout (`(auth)/layout.tsx`)

Minimal centered card layout with optional ambient glow effect. No shell chrome.

### Admin Layout (`(admin)/layout.tsx`)

```
<RouteGuard onDenied="redirect">  ← Permission gate
  <AdminLayout hideSidebar>        ← Header-only AppShell variant
    <PageContainer>
      <ContentContainer>
        {children}
      </ContentContainer>
    </PageContainer>
  </AdminLayout>
</RouteGuard>
```

## Provider Architecture

```
ReactQueryProvider (query client)
  └── ThemeProvider (dark/light mode)
        └── TooltipProvider (delay config)
              └── AuthProvider (session restoration, auth context)
                    └── Page Content
```

### AuthProvider Responsibilities

- Reads stored JWT from auth-store (Zustand persist)
- Calls `useCurrentUser()` to restore session on app load
- Exposes `login()`, `register()`, `logout()` via React Context
- Marks `isRestoring` until session restoration settles
- Clears auth if stored token is invalid

## Data Flow Architecture

```
┌─────────────────────────────────────────────────┐
│                  Page Component                   │
│  (useSuspenseQuery / useMutation)                │
│                                                   │
│  Reads: data, isLoading, error, mutate            │
│  Renders: LoadingState / ErrorState / content     │
└────────────────────┬────────────────────────────┘
                     │ calls
                     ▼
┌─────────────────────────────────────────────────┐
│               React Query Hook                    │
│  (useAgent, useOrganization, useLogin)            │
│                                                   │
│  Defines: queryKey, queryFn, staleTime, gcTime   │
│  Handles: onSuccess cache invalidation            │
└────────────────────┬────────────────────────────┘
                     │ calls
                     ▼
┌─────────────────────────────────────────────────┐
│                  Service Layer                    │
│  (authService, agentService, organizationService) │
│                                                   │
│  Pure function wrappers:                          │
│  apiClient.get/post/patch/delete                  │
│  Bakes: API URL, response unwrapping              │
└────────────────────┬────────────────────────────┘
                     │ calls
                     ▼
┌─────────────────────────────────────────────────┐
│               apiClient (Axios)                   │
│                                                   │
│  Interceptors:                                    │
│  - JWT attachment from localStorage               │
│  - Activity tracking (begin/end)                  │
│  - 401 → token removal                            │
│  - Response unwrapping (.data)                    │
└────────────────────┬────────────────────────────┘
                     │ HTTP
                     ▼
┌─────────────────────────────────────────────────┐
│                 Backend API                       │
└─────────────────────────────────────────────────┘
```

### When to use React Query

- Any data that originates from the server (API calls)
- Data that needs caching, refetching, or background updates
- Mutations that update server state
- Example: agents list, organization details, user profile

### When to use Zustand

- Data that exists only on the client
- UI state (sidebar collapsed, active tab, expanded groups)
- Persisted client state (auth tokens, active org, theme)
- Shared state accessed by unrelated components
- Activity tracking for the GlobalLoader

### Current Zustand Stores

| Store | Purpose | Persisted |
|---|---|---|
| `auth-store` | User, tokens, isRestoring | Tokens only |
| `org-store` | Organizations list, active org | Active org |
| `ui-store` | Sidebar open/close | No |
| `shell-store` | Sidebar collapse, groups, breadcrumb overrides | No |
| `activity-store` | Global activity counter for loader | No |

## Component Architecture

### UI Components (`components/ui/`)

Pure presentational components. No business logic, no API calls, no store access (except theme tokens).

**Typography:** Text, Heading, Caption, Code, Link
**Form system:** Form, FormField, FormLabel, FormDescription, FormMessage, RequiredIndicator, FieldGroup, FormSection, Input, Textarea, Select, Checkbox, Switch, RadioGroup, InputGroup
**Feedback:** Alert, Notice, Banner, Toast, LoadingState, ErrorState, SuccessState, EmptyState
**Overlay:** Dialog, ConfirmDialog, Sheet, Popover, Tooltip, DropdownMenu, Command
**Data display:** Badge, StatusBadge, Card, Table, DataTable, Pagination, ProgressRing, Progress, Skeleton
**Utility:** Button, Separator, ScrollArea, Avatar, Surface, Panel, Toolbar, ActionGroup, IconContainer, Tabs, Label, Breadcrumb

All components use `cn()` utility for class merging and accept standard HTML attributes via spread props.

### Layout Components (`components/layout/`)

| Component | Purpose |
|---|---|
| `PageContainer` | Responsive horizontal padding wrapper |
| `ContentContainer` | Max-width constrained (80rem default) centered wrapper |
| `PageHeader` | Page title + description + actions |
| `PageActions` | Action buttons row (secondary) |
| `Section` / `SectionHeader` / `SectionContent` | Card-like grouped content block |
| `Grid` / `GridItem` | Responsive CSS Grid with breakpoint controls |
| `SplitLayout` | Two-panel split view |
| `AuthLayout` | Centered auth card with ambient glow |
| `AdminLayout` | Header-only AppShell variant |

### Shell Components (`components/shell/`)

| Component | Purpose |
|---|---|
| `AppShellProvider` | React context for navigation state, sidebar state, extensions |
| `ShellSidebar` | Collapsible sidebar with nav groups, extension slots |
| `ShellHeader` | Breadcrumbs, search, theme toggle, user menu, notification bell |
| `ShellBreadcrumbs` | Route-registry-driven breadcrumb trail |
| `GlobalLoader` | Fixed top progress bar driven by activity-store |
| `RouteGuard` | Permission + feature-flag gate (redirect/hide/fallback) |
| `ShellExtensionRegistry` | Position-based extension system |

## Navigation Architecture

See [05-routing.md](05-routing.md) for full documentation.

## Theme System

See [06-design-system.md](06-design-system.md) for full documentation.

## TypeScript Types

Domain types mirror backend schemas and live in `src/types/domain.ts`:

- `User`, `LoginRequest`, `RegisterRequest`, `TokenPair`, `LoginResponse`
- `Organization`, `OrganizationMember`, `OrganizationRole`
- `Agent`, `AgentCreate`, `AgentUpdate`
- `Timestamps`

These are the **single source of truth** for entity shapes used across services, hooks, and stores.

## Barrel Exports

Every module has an `index.ts` barrel that re-exports its public API:

```typescript
// src/hooks/index.ts
export { useLogin, useCurrentUser } from './use-auth';
export { useAgents, useAgent } from './use-agents';
// ...

// src/services/index.ts
export { authService } from './auth';
export { agentService } from './agents';
// ...
```
