# 07 — Development Guide

## Data Flow Rules

### Rule 1: Components never call Axios directly

```
✅ CORRECT:
Component → React Query Hook → Service → apiClient → Backend

❌ WRONG:
Component → apiClient → Backend
Component → fetch() → Backend
Component → direct axios call
```

### Rule 2: Services are pure API wrappers

Services only:
- Call apiClient with the correct HTTP method and URL
- Unwrap the response envelope (return `res.data`)
- Do NOT transform data, cache, or handle state

```typescript
// ✅ Correct service pattern
export const agentService = {
  async list(orgId: string): Promise<Agent[]> {
    const res = await apiClient.get(`/organizations/${orgId}/agents`) as ApiResponse<Agent[]>;
    return res.data;
  },
};

// ❌ Wrong — service does business logic
export const agentService = {
  async list(orgId: string): Promise<Agent[]> {
    const res = await apiClient.get(`/organizations/${orgId}/agents`);
    return res.data.filter(a => a.is_active).sort(...); // WRONG: business logic in service
  },
};
```

### Rule 3: React Query manages server state

- Use `useQuery` for data fetching (GET requests)
- Use `useMutation` for data mutations (POST/PUT/PATCH/DELETE)
- Use `queryClient.invalidateQueries` to refetch after mutations
- Define query keys as structured constants:

```typescript
export const agentKeys = {
  all: (orgId: string) => ['organizations', orgId, 'agents'] as const,
  list: (orgId: string) => [...agentKeys.all(orgId), 'list'] as const,
  detail: (orgId: string, agentId: string) => [...agentKeys.all(orgId), 'detail', agentId] as const,
};
```

### Rule 4: Zustand manages client state only

**Use Zustand for:**
- UI state (sidebar collapsed, active tab)
- Persisted client state (auth tokens, active org)
- Shared state between unrelated components
- Activity tracking for the GlobalLoader

**Do NOT use Zustand for:**
- Data that comes from the API (use React Query)
- Computed/derived data (useMemo it)

### Rule 5: Components stay presentational

- Components receive data and callbacks as props (or from hooks/context)
- Components do NOT directly manipulate API state
- Components do NOT contain business logic
- Pages compose components with data from hooks

```
Page Component (owns data fetching via hooks)
  └── Presentational Components (receive props)
```

## Architecture Rules

### Rule 6: Runtime never imports business domains

The Runtime (voice pipeline) must remain completely decoupled from business domains (agents, users, organizations). The Runtime should not know about:
- Agent configurations directly (receives config via interface)
- Organization membership
- User authentication

### Rule 7: Infrastructure never contains business logic

Infrastructure layer provides:
- Database connections and sessions
- Redis caching
- External API adapters
- File storage

It does NOT contain:
- Business rules or validation
- Domain entity manipulation
- Authorization checks

### Rule 8: Providers stay thin

Provider adapters (WhisperAdapter, OllamaAdapter, etc.) should:
- Translate between the port interface and the provider's SDK
- Handle authentication and connection lifecycle
- Map errors to the application's exception format
- Be testable in isolation

They should NOT:
- Contain Runtime logic (loops, state machines)
- Modify conversation context directly
- Make business decisions

### Rule 9: Route registry is the single source of truth

- Every route is defined in `src/navigation/routes.ts`
- Sidebar, breadcrumbs, search, RouteGuard all consume the registry
- Adding a route = one entry. No scattered configs.
- Route metadata includes permissions, feature flags, search keywords

### Rule 10: Extension registry over hardcoded slots

- Features plug into the shell via `ShellExtensionRegistry`
- Positions: `sidebar-header`, `sidebar-footer`, `header-left`, `header-right`, `overlay`
- Never hardcode feature-specific components (org switcher, search) into shell files
- Register extensions from feature modules, not from the shell

## Folder Conventions

### Frontend

```
src/
├── app/                    ← Next.js App Router pages
│   (client)/               ← Client routes with shell layout
│   (auth)/                 ← Auth routes with auth layout
│   (admin)/                ← Admin routes with admin layout
│
├── components/
│   ├── ui/                 ← Design system primitives (generic, reusable)
│   ├── layout/             ← Layout primitives (PageContainer, Grid, Section)
│   └── shell/              ← Application shell components
│
├── hooks/                  ← React Query hooks
├── services/               ← API call functions
├── store/                  ← Zustand stores
├── navigation/             ← Route registry, permissions, nav hooks
├── config/                 ← Environment, feature flags, constants
├── contexts/               ← React contexts (auth)
├── lib/                    ← Utilities (apiClient, cn())
├── types/                  ← TypeScript domain types
├── theme/                  ← Design tokens
└── styles/                 ← Global CSS

Frontend file naming:
- React components: PascalCase (PageContainer.tsx, ShellSidebar.tsx)
- Hooks: kebab-case (use-auth.ts, use-agents.ts)
- Services: kebab-case (auth.ts, agents.ts)
- Stores: kebab-case (shell-store.ts, activity-store.ts)
- Config: kebab-case (features.ts, constants.ts)
- Utilities: kebab-case (api-client.ts, utils.ts)
- Types: kebab-case (domain.ts)
- CSS: globals.css, utilities.css
```

### Backend

```
app/
├── api/
│   ├── v1/                 ← HTTP route handlers
│   └── websockets/         ← WebSocket route handlers
│   └── dependencies.py     ← FastAPI DI
├── domain/                 ← Business logic
├── infrastructure/         ← DB, cache, adapters
├── runtime/                ← Voice pipeline
└── core/                   ← Config, security, exceptions, responses

Backend file naming:
- Python files: snake_case (config.py, logging_service.py)
- Class names: PascalCase (Settings, BaseAppException)
- Functions: snake_case (verify_password, create_access_token)
- Models: PascalCase (UserResponse, APIResponse)
```

## Reuse Rules

### Do Not Duplicate

- ✅ Reuse existing UI components before building new ones
- ✅ Import from barrel exports (`@/hooks`, `@/services`, `@/components/ui`)
- ✅ Use existing design tokens for all visual properties
- ❌ Create a new component when an existing one can be extended

### Component Hierarchy Check

Before building a component:

1. **Check `components/ui/`** — does a generic version exist?
2. **Check `components/layout/`** — does a layout primitive fit?
3. **Check `components/shell/`** — does a shell component handle this?
4. **Only then** — create a new component

### Import Rules

- Components import UI primitives: `from '@/components/ui/button'`
- Pages import layout primitives: `from '@/components/layout'`
- Pages/hooks import hooks: `from '@/hooks'`
- Services import apiClient: `from '@/lib/api-client'`
- Stores import from store: `from '@/store/auth-store'`
- Config from config: `from '@/config/env'`
- Theme from theme: `from '@/theme'`

## State Decision Matrix

| Type of State | Tool | Example |
|---|---|---|
| Server data (list agents) | React Query `useQuery` | `useAgents(orgId)` |
| Server mutations | React Query `useMutation` | `useCreateAgent()` |
| Persistent client auth | Zustand + persist | `useAuthStore` |
| UI toggle state | Zustand | `useShellStore.collapsed` |
| Global activity | Zustand | `useActivityStore.count` |
| Form state | React local state | `useState` + form components |
| URL state | Next.js `useSearchParams` | `tab=overview` |
| Theme preference | next-themes | `useTheme()` |

## Error Handling

### Backend

- Expected errors → raise `BaseAppException` subclass
- Unexpected errors → caught by catch-all handler → sanitized 500
- Always log the error at the appropriate level
- Never expose stack traces to API consumers

### Frontend

- Server errors → React Query `error` → `ErrorState` component
- Loading → React Query `isLoading` → `LoadingState` component
- Empty data → `EmptyState` with appropriate icon and message
- Form validation → field-level error messages via form components
- Network errors → handled by apiClient interceptor

## Testing Expectations

- **React Query hooks:** Test query keys, mutation callbacks, cache invalidation
- **Services:** Test that correct URLs and methods are called
- **Components:** Test rendering of states (loading, empty, error, populated)
- **Stores:** Test state transitions and persistence
- **Backend:** Test API endpoints, domain logic, adapter integration
- **Runtime:** Test orchestrator loop with mock providers

## Performance Guidelines

- Use React Query's `staleTime` to avoid unnecessary refetches (5 min default)
- Use `useMemo` and `useCallback` for expensive computations and callback stability
- Lazy-load route segments via Next.js App Router (automatic)
- Avoid large Zustand stores (split by concern)
- Use `Skeleton` for optimistic loading states
- Avatar fallbacks use initials (no image requests for placeholder)
