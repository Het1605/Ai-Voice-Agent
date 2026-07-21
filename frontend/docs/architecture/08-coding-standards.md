# 08 — Coding Standards

## Naming Conventions

### Frontend (TypeScript/React)

| What | Convention | Examples |
|---|---|---|
| React components | PascalCase | `PageContainer`, `ShellSidebar`, `EmptyState` |
| React hooks (files) | kebab-case | `use-auth.ts`, `use-agents.ts` |
| React hooks (functions) | camelCase, `use*` prefix | `useAuth()`, `useAgents()` |
| Functions | camelCase | `getRouteById()`, `hasPermission()` |
| Types/interfaces | PascalCase | `RouteDefinition`, `AuthContextValue` |
| Enums | PascalCase | `OrganizationRole` |
| Constants | UPPER_SNAKE | `ROLE_HIERARCHY`, `STORAGE_KEYS` |
| Files (components) | PascalCase | `empty-state.tsx`, `button.tsx` |
| Files (non-component) | kebab-case | `api-client.ts`, `shell-store.ts` |
| CSS classes | Tailwind utilities | Inline, no custom class names |
| CSS custom properties | `--kebab-case` | `--content-max-width` |

### Backend (Python)

| What | Convention | Examples |
|---|---|---|
| Classes | PascalCase | `BaseAppException`, `Settings` |
| Functions | snake_case | `verify_password()`, `create_access_token()` |
| Variables | snake_case | `hashed_password`, `db_session` |
| Constants | UPPER_SNAKE | `API_V1_STR`, `JWT_SECRET_KEY` |
| Files | snake_case | `config.py`, `logging_service.py` |
| Modules (directories) | snake_case | `core/`, `infrastructure/` |
| Database models | PascalCase | `User`, `Organization`, `Agent` |
| Pydantic schemas | PascalCase | `APIResponse`, `LoginRequest` |
| Private methods | `_prefix` | `_validate_config()` |

## Folder Conventions

### Frontend

```
Each module folder:
  ├── index.ts              ← Barrel export
  ├── component.tsx         ← Main component file
  ├── component.types.ts    ← (optional) types for complex components
  └── component.test.tsx    ← (future) tests

Doing a barrel export:
✅ Always create an index.ts in each module folder
✅ Export public API only
❌ Never import from sibling modules (import from barrel)
```

### Backend

```
Each layer:
  ├── __init__.py           ← Package init (may re-export)
  ├── module_file.py        ← One concern per file
  └── subdirectory/         ← Sub-modules for complex concerns

API routers:
  ├── router.py             ← Aggregates endpoints
  ├── endpoints/            ← (optional) separate files for complex routers
  
Domain:
  ├── models/               ← Domain entities
  ├── services/             ← Business logic
  └── repositories/         ← Repository interfaces
```

## Import Conventions

### Frontend

```typescript
// ✅ Prefer barrel imports
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks';
import { authService } from '@/services';
import { cn } from '@/lib/utils';

// ✅ Absolute imports (using @/ prefix)
import { PageContainer } from '@/components/layout';
import { routes } from '@/navigation/routes';

// ❌ No relative imports that go deep
import { Button } from '../../components/ui/button';
import { useAuth } from '../../../hooks/use-auth';

// ✅ Ordered imports: external → internal
import { useMemo } from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
```

### Backend

```python
# ✅ Ordered: standard lib → third-party → internal
import logging
from typing import AsyncGenerator

from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.config import settings
from backend.app.infrastructure.database.session import get_db

# ✅ Use full module paths (not relative imports within app/ level)
from backend.app.core.exceptions import BaseAppException

# ❌ No sys.path manipulation
import sys; sys.path.append("..")
```

## TypeScript Rules

### Strict Mode

TypeScript strict mode is enabled. Do NOT use `any` unless absolutely necessary.

```typescript
// ✅ Strong typing on all functions
function hasPermission(userRole: PermissionRole | null | undefined, requiredRole?: PermissionRole): boolean

// ✅ Generic constraints
async function fetchData<T>(url: string): Promise<T>

// ✅ Type inference where obvious
const spacing = { sm: 4, md: 8, lg: 16 } as const;
// TypeScript infers: { readonly sm: 4; readonly md: 8; readonly lg: 16 }

// ❌ No untyped parameters
function process(data: any): any  // WRONG

// ✅ Use union types, not any
function process(data: string | number): string
```

### Interfaces vs Types

```typescript
// ✅ Use interfaces for public APIs (they extend better)
export interface RouteDefinition {
  id: string;
  title: string;
  href: string;
}

// ✅ Use type for unions, intersections, and internal types
type PermissionRole = 'guest' | 'member' | 'admin' | 'owner';
type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 12;
```

### Props

```typescript
// ✅ Export component props interface
export interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

// ❌ Don't inline props
function Button({ variant, size, className }: { variant?: string; size?: string; className?: string })
```

## React Rules

### Component Pattern

```typescript
'use client';

import { cn } from '@/lib/utils';

export interface MyComponentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * MyComponent
 *
 * Two-line description of what this does.
 * Additional usage notes.
 */
function MyComponent({
  children,
  className,
  ...props
}: MyComponentProps) {
  return (
    <div className={cn('base-styles-here', className)} {...props}>
      {children}
    </div>
  );
}

export { MyComponent };
```

### Hook Pattern

```typescript
'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { organizationService } from '@/services/organizations';
import { useOrgStore } from '@/store/org-store';

// Query keys as structured constants
export const orgKeys = {
  all: ['organizations'] as const,
  mine: () => [...orgKeys.all, 'mine'] as const,
};

/**
 * useMyOrganizations
 *
 * Description of what this hook does.
 */
export function useMyOrganizations() {
  const { setOrganizations } = useOrgStore();

  return useQuery({
    queryKey: orgKeys.mine(),
    queryFn: async () => {
      const data = await organizationService.getMyOrganizations();
      setOrganizations(data.map((m) => m.organization));
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
```

### Client Component Rule

- Add `'use client'` directive at the top of any component that uses hooks, state, effects, or browser APIs
- Server components are the default — only add `'use client'` when needed
- Keep server components where possible for smaller bundle size

## FastAPI Rules

### Route Handler Pattern

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.dependencies import get_db_session
from backend.app.core.response import success_response

router = APIRouter()

@router.get("/")
async def list_items(
    db: AsyncSession = Depends(get_db_session),
):
    """Description of what this endpoint does."""
    items = await service.get_all(db)
    return success_response(items)
```

### Error Handling in Routes

```python
# ✅ Use exception classes, not try/except in routes
@router.get("/{item_id}")
async def get_item(item_id: str, db: AsyncSession = Depends(get_db_session)):
    item = await service.get_by_id(db, item_id)
    if not item:
        raise NotFoundException(detail=f"Item {item_id} not found")
    return success_response(item)

# ❌ Don't handle errors inline
@router.get("/{item_id}")
async def get_item(item_id: str, db: AsyncSession = Depends(get_db_session)):
    try:  # WRONG — let exception handlers do this
        item = await service.get_by_id(db, item_id)
        if not item:
            return JSONResponse(status_code=404, content=...)
        return {"success": True, "data": item}
    except Exception as e:
        return JSONResponse(status_code=500, content=...)
```

## Error Handling Conventions

### Frontend

```typescript
// ✅ Three states in every data view:
function AgentList() {
  const { data, isLoading, error } = useAgents(orgId);

  if (isLoading) return <LoadingState fullPage />;
  if (error) return <ErrorState fullPage error={error as Error} onRetry={() => refetch()} />;
  if (!data?.length) return <EmptyState icon={Bot} title="No agents" description="..." />;

  return <DataView data={data} />;
}
```

### Backend

```python
# ✅ Raise standard exceptions
def validate_organization_access(user: User, organization_id: str):
    if not user.organizations.get(organization_id):
        raise ForbiddenException(detail="Access to this organization is denied")

# ✅ Log properly
import logging
logger = logging.getLogger(__name__)

try:
    result = await some_operation()
except Exception as e:
    logger.error("Operation failed for org %s: %s", org_id, str(e))
    raise InternalServerException() from e
```

## Logging Conventions

### Backend

```python
# ✅ Always use named loggers
logger = logging.getLogger(__name__)

# ✅ Structured logging messages
logger.info("User %s logged in from IP %s", user_id, client_ip)
logger.error("Payment failed for org %s: %s", org_id, error_message)

# ✅ Log levels:
# DEBUG: Detailed diagnostic info (development only)
# INFO: Normal operational events (login, create, update)
# WARNING: Unexpected but handled issues (retry, fallback)
# ERROR: Failed operations that need investigation
# CRITICAL: System-level failures requiring immediate action
```

## Testing Expectations

### Checklist

- [ ] Each React Query hook has tests for: success, error, cache invalidation
- [ ] Each service has tests for: correct URL, method, response unwrapping
- [ ] Each component has tests for: loading, empty, error, populated states
- [ ] Each store has tests for: state transitions, persistence
- [ ] Each API endpoint has tests for: valid request, invalid request, auth failure, not found
- [ ] Each domain service has tests for: business rules, edge cases, error conditions

## PR Checklist

Before submitting a PR:

- [ ] No TypeScript errors (`npm run build` or `tsc --noEmit`)
- [ ] No lint errors (`npm run lint`)
- [ ] No `console.log` or debug artifacts
- [ ] All new components have loading, empty, error states
- [ ] Dark mode checked for all visual changes
- [ ] Responsive behavior checked (mobile, tablet, desktop)
- [ ] No hardcoded colors, spacing, or other design tokens
- [ ] Barrel exports updated for new components
- [ ] Route registry updated if adding/modifying pages
- [ ] No business logic in components or API routers
- [ ] Tests pass (if applicable)

## Code Review Checklist

- [ ] Does the code follow the folder structure conventions?
- [ ] Are imports clean (barrel exports, no deep relative paths)?
- [ ] Are component props properly typed and exported?
- [ ] Does the data flow follow Component → Hook → Service → API Client?
- [ ] Is client state (Zustand) separated from server state (React Query)?
- [ ] Are design tokens used instead of hardcoded values?
- [ ] Are error states handled?
- [ ] Is dark mode supported?
- [ ] Are there unused imports, variables, or dead code?
- [ ] Is the code accessible (ARIA, keyboard nav, contrast)?

## Architecture Review Checklist

Before significant architecture changes:

- [ ] Does the change violate the dependency direction rules?
- [ ] Does the change add coupling between layers that should be independent?
- [ ] Is the Runtime still provider-agnostic?
- [ ] Is the route registry still the single source of truth?
- [ ] Are extensions registered (not hardcoded into shell components)?
- [ ] Is business logic in domain services (not infrastructure or API)?
- [ ] Is the change adding a new pattern or following existing patterns?
- [ ] Is the change consistent with the documented architecture?
