# 05 — Routing & Navigation Architecture

## Single Source of Truth

The **Route Registry** (`src/navigation/routes.ts`) is the single canonical definition of every route in the application. The sidebar, breadcrumbs, search, RouteGuard, and navigation hooks all consume this same configuration.

**Adding a new route = one entry in the registry.** No scattered configuration.

## Route Registry

### RouteDefinition

```typescript
interface RouteDefinition {
  id: string;                 // Unique, namespaced (e.g. "agents.list", "agents.detail")
  title: string;              // Human-readable page title
  href: string;               // URL path (static only; params via parent)
  icon?: LucideIcon;          // Icon for sidebar
  group?: string;             // Sidebar group label (omit/empty = not in sidebar)
  parentId?: string;          // Parent route id for breadcrumb hierarchy
  permission?: PermissionRole; // Minimum role required (guest/member/admin/owner)
  featureFlag?: string;       // Feature flag that gates access
  badge?: string | number;    // Badge on nav item
  hidden?: boolean;           // Hide from sidebar nav (detail pages)
  order?: number;             // Sort order within group
  description?: string;       // For search indexing and meta tags
  keywords?: string[];        // For command palette / global search
  exact?: boolean;            // Exact match (vs prefix match)
}
```

### Registry Example

```typescript
export const routes: RouteDefinition[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    group: 'main',
    permission: 'member',
    order: 1,
    description: 'Platform overview and key metrics',
    keywords: ['overview', 'metrics', 'home'],
  },
  {
    id: 'agents.list',
    title: 'Agents',
    href: '/agents',
    icon: Bot,
    group: 'main',
    permission: 'member',
    order: 2,
  },
  {
    id: 'agents.detail',
    title: 'Agent',
    href: '/agents/[id]',
    group: 'main',
    permission: 'member',
    hidden: true,
    parentId: 'agents.list',
  },
  // ... 34 more entries
];
```

### Helper Functions

| Function | Purpose |
|---|---|
| `getRouteById(id)` | Lookup by route id |
| `getRouteByHref(href)` | Lookup by URL (exact match first, then prefix) |
| `getRouteChain(href)` | Parent chain for breadcrumbs |
| `groupRoutes(routes)` | Group by `group` field, sorted by `order` |

### Agent Workspace Tabs

Agent detail pages use a separate tab system:

```typescript
export const agentWorkspaceTabs: AgentTabDefinition[] = [
  { key: 'overview',   title: 'Overview',   href: (id) => `/agents/${id}/overview` },
  { key: 'prompt',     title: 'Prompt',     href: (id) => `/agents/${id}/prompt` },
  // ... 9 more tabs
];
```

These are rendered in the agent detail layout (`agents/[id]/layout.tsx`) as navigation tabs.

## Permissions

### Hierarchy

```
guest (0) < member (1) < admin (2) < owner (3)
```

### Permission Model

Permissions are **role-based** (RBAC). Each route has a `permission` field specifying the minimum role required. The system has NO authorization logic — just pure comparison utilities.

```typescript
export type PermissionRole = 'guest' | 'member' | 'admin' | 'owner';

// Pure function — no store access, no side effects
export function hasPermission(userRole, requiredRole): boolean {
  if (!requiredRole) return true;     // No restriction
  if (!userRole) return false;        // Unauthenticated
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
```

### Current Role Assignments

| Route | Minimum Role |
|---|---|
| Auth routes (login, register, forgot-password) | None (public) |
| Dashboard, Agents, Calls, Knowledge | member |
| Analytics, Team, Integrations | admin |
| Billing | owner |
| Admin routes | admin |

## Feature Flags

Feature flags gate access at the route level:

```typescript
export const FEATURE_FLAGS = {
  enablePhoneAgents: false,
  enableTwilioIntegration: false,
  enableSipIntegration: false,
  enableStripeBilling: false,
  enableDebugPanel: process.env.NODE_ENV === 'development',
};
```

Routes with `featureFlag` that is disabled are automatically excluded from navigation and blocked by RouteGuard.

## Navigation Hook (`useNavigation`)

```typescript
interface UseNavigationReturn {
  visibleRoutes: RouteDefinition[];       // Role + feature-flag filtered
  navigationGroups: NavigationGroup[];    // Grouped for sidebar rendering
  currentRoute: RouteDefinition | null;   // Matching current pathname
  breadcrumbs: RouteDefinition[];         // Current breadcrumb trail
  canAccess: (routeId: string) => boolean;
  hasFeature: (flag: string) => boolean;
}
```

Consumed by `AppShellProvider` to provide navigation state to all shell components.

## Breadcrumbs

Breadcrumbs are **automatically generated** from the route registry's parent chain.

```
Route Entry: { id: "settings.security", parentId: "settings.general" }
                    ↓
Breadcrumbs: Settings > Security
                    ↓
Lookup: getRouteByHref("/settings") → getRouteById("settings.security")
```

Breadcrumbs support label overrides via `shell-store`:

```typescript
useShellStore.getState().setBreadcrumbOverride('agents.detail', 'My Custom Agent');
```

## RouteGuard

### Behavior

| `onDenied` | Result |
|---|---|
| `'redirect'` | Redirect to `redirectTo` (default `/login`) |
| `'hide'` | Render nothing |
| `'fallback'` | Render `fallback` element |

### Usage

```typescript
// Protect admin routes
<RouteGuard onDenied="redirect" redirectTo="/dashboard">
  <AdminLayout>{children}</AdminLayout>
</RouteGuard>
```

RouteGuard is a **thin coordinator** — it looks up the route from the registry, checks permission and feature flag, then renders or redirects. No business logic.

## Application Shell

### AppShellProvider

The `AppShellProvider` is a **UI-only provider** that:
- Consumes `useNavigation()` for filtered routes and breadcrumbs
- Reads sidebar state from `shell-store` (collapsed, expanded groups)
- Manages the extension registry
- Tracks navigation transitions

It does **NOT** own auth, org, or business state. It reads the user's role from `auth-store` to filter navigation, but the store lives outside the provider.

### Context Value

```typescript
interface AppShellContextValue {
  navigationGroups: NavigationGroup[];     // Filtered routes for sidebar
  currentRoute: RouteDefinition | null;
  breadcrumbs: RouteDefinition[];
  collapsed: boolean;                      // Sidebar state
  toggleCollapsed: () => void;
  expandedGroups: Set<string>;
  toggleGroup: (group: string) => void;
  hasFeature: (flag: string) => boolean;
  canAccess: (routeId: string) => boolean;
  getExtensionsAt: (position: ExtensionPosition) => ReactNode[];
  isNavigating: boolean;
}
```

## Extension Registry

The `ShellExtensionRegistry` allows features to plug components into shell positions without modifying shell components.

### Positions

| Position | Location |
|---|---|
| `sidebar-header` | Above nav items (org switcher) |
| `sidebar-footer` | Below nav items (help, theme toggle) |
| `header-left` | Far left of header |
| `header-center` | Center of header |
| `header-right` | Far right of header |
| `overlay` | Full-viewport (command palette) |

### Registration

```typescript
const registry = new ShellExtensionRegistry();
registry.register([
  {
    id: 'org-switcher',
    position: 'sidebar-header',
    component: <OrgSwitcher />,
    order: 10,
  },
]);
```

Extensions support `order`, `requiredPermission`, and `requiredFeatureFlag` for conditional rendering.

## Adding a New Route

### Step-by-step

1. **Add to route registry** (`src/navigation/routes.ts`):

```typescript
{
  id: 'my-module.list',
  title: 'My Module',
  href: '/my-module',
  icon: CustomIcon,
  group: 'main',
  permission: 'member',
  order: 6,
  description: 'Description for search',
  keywords: ['key1', 'key2'],
}
```

2. **Create the page file** (`src/app/(client)/my-module/page.tsx`):

```typescript
export default function MyModulePage() {
  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader title="My Module" description="..." actions={<Button>Action</Button>} />
        <Section>
          <EmptyState icon={Icon} title="Coming soon" description="..." />
        </Section>
      </ContentContainer>
    </PageContainer>
  );
}
```

3. **Add loading and error states** (`loading.tsx`, `error.tsx`):

```typescript
// loading.tsx
export default function Loading() { return <LoadingState fullPage />; }

// error.tsx
'use client';
export default function Error({ error, reset }) { return <ErrorState fullPage error={error} onRetry={reset} />; }
```

4. **That's it.** The sidebar, breadcrumbs, and search automatically pick up the new route from the registry.

### For hidden/detail pages

Add `hidden: true` and a `parentId`. The page won't appear in the sidebar but will still have breadcrumbs and guard protection.

## Navigation Groups

| Group | Label | Routes |
|---|---|---|
| `main` | (none) | Dashboard, Agents, Calls, Knowledge, Analytics |
| `org` | Organization | Team, Billing, Integrations, Settings |
| `admin` | Administration | Admin Dashboard, Users, Organizations, Audit Logs |

Groups are rendered in this order by the sidebar. Routes within each group are sorted by their `order` field.
