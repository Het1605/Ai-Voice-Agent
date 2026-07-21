# 09 — Architecture Decision Log

Every significant architectural decision made during Phase 0 (Foundation) is documented here with its context, rationale, benefits, and tradeoffs.

---

## AD-01: Route Registry as Single Source of Truth

### Decision
All routes are defined in a single flat array (`src/navigation/routes.ts`). The sidebar, breadcrumbs, search, RouteGuard, and navigation hooks all consume this same configuration.

### Reason
In many Next.js projects, navigation state is scattered: sidebar config in one file, breadcrumbs in another, permission checks duplicated everywhere. A single registry eliminates duplication and guarantees consistency.

### Benefits
- Adding a route = one entry. No scattered configs.
- Breadcrumbs are automatically generated from the registry hierarchy
- RouteGuard reads permissions from the same source as the sidebar
- Search/command palette index from the same data
- Route metadata (keywords, descriptions) lives with the route definition

### Tradeoffs
- The flat array must be manually maintained as routes grow
- Dynamic route segments (agents/[id]) need to be handled with pattern matching

---

## AD-02: React Query + Zustand (Two-State Architecture)

### Decision
Use **React Query** for all server state (API data) and **Zustand** for client-only state (UI, persisted auth, activity tracking).

### Reason
A single global store (Redux, single Zustand) mixing server and client state leads to:
- Stale data that doesn't reflect the server
- Complex cache invalidation logic
- Boilerplate reducers for simple API data

React Query handles caching, background refetching, optimistic updates, and cache invalidation by design. Zustand handles what React Query cannot: pure client state.

### Benefits
- Server data is always fresh (staleTime, refetchOnMount, cache invalidation)
- Client state is minimal and predictable
- No Redux boilerplate (actions, reducers, middleware)
- Zustand persist middleware handles token/org persistence

### Tradeoffs
- Two state management libraries to learn
- Requires clear discipline about what goes where
- React Query's global callbacks need careful configuration

---

## AD-03: Extension Registry over Hardcoded Slots

### Decision
Shell components expose position-based extension slots (`sidebar-header`, `header-right`, etc.) backed by a `ShellExtensionRegistry` class. Features register themselves into these slots rather than being hardcoded in shell components.

### Reason
Hardcoding feature-specific components (org switcher, search, notifications) into the shell creates coupling between the layout and features. Every new feature that needs shell real estate requires modifying shell files. The extension registry allows features to declare their shell presence from their own module.

### Benefits
- Shell components never import feature-specific code
- Features can be added/removed without touching layout files
- Extensions support conditional rendering (permission, feature flag)
- Sortable (order field determines position within a slot)

### Tradeoffs
- More indirection (tracing which extension renders where requires checking registration calls)
- Runtime registration means no compile-time slot validation

---

## AD-04: Runtime Outside Domain Layer

### Decision
The voice pipeline Runtime (`app/runtime/`) exists as a separate layer alongside Domain, not inside it. Runtime communicates with providers through abstract ports defined in `runtime/ports.py`.

### Reason
The Runtime has fundamentally different concerns than business domains:
- Real-time audio processing (not CRUD)
- Provider abstraction (STT/LLM/TTS are not business models)
- Streaming, not request-response

Placing it in Domain would couple business logic to audio pipeline details. Making it a separate layer with abstract ports ensures provider swaps don't affect business code.

### Benefits
- Runtime can be developed, tested, and deployed independently
- Adding a new provider = one adapter file (no Runtime changes)
- Orchestrator can be swapped (Simple → LangGraph) without touching the pipeline
- Business domains remain clean of audio concerns

### Tradeoffs
- Additional architectural complexity
- Runtime must receive all its configuration via interfaces (no direct access to agent settings)
- Event propagation requires a pub/sub mechanism (Redis)

---

## AD-05: Design Tokens with CSS Variables

### Decision
Design tokens are defined as TypeScript constants (for programmatic access) mapped to CSS custom properties (for runtime theming). Components reference CSS variables, never hardcoded values.

### Reason
Hardcoded colors, spacing, and sizes make theming impossible and refactoring painful. Separating token definition (TypeScript) from token application (CSS via `var(--token)`) enables:
- Dark/light mode switching via CSS variable overrides
- Programmatic access to tokens for calculations
- A single source of truth for the visual language

### Benefits
- Dark mode = swapping CSS variable values (no component changes)
- Consistent visual language enforced at the token level
- Tailwind theme configured from the same variables
- Easy to rebrand by changing variable values

### Tradeoffs
- More abstraction (tokens → CSS variables → Tailwind → components)
- Debugging requires tracing through multiple layers
- CSS variable performance (marginal, not an issue in practice)

---

## AD-06: AppShellProvider as UI-Only Provider

### Decision
The `AppShellProvider` manages navigation state, sidebar state, and extension rendering. It does NOT own authentication, organization state, or business data.

### Reason
A common anti-pattern is a monolithic AppContext that grows to include everything. Keeping AppShellProvider focused on UI concerns ensures:
- Shell state is independent of auth state
- Shell components can be developed/rendered without auth
- Business logic belongs in the appropriate layer, not the shell

### Benefits
- Shell tests don't need auth fixtures
- Auth changes don't affect shell behavior
- Clear separation of concerns
- Shell can be reused in different auth contexts

### Tradeoffs
- Shell components must read auth-store directly for permission filtering
- Minor duplication of the "current user" concept

---

## AD-07: Component → Hook → Service → API Client Data Flow

### Decision
Data flows through four layers: Component → React Query Hook → Service → API Client → Backend. Each layer has a distinct responsibility.

### Reason
Direct API calls from components lead to:
- Duplicated API URLs and error handling
- No caching or deduplication
- Hard-to-test components
- Scattered API logic

The layered approach ensures:
- **Components** remain presentational (testable with mock data)
- **Hooks** handle caching, refetching, and state (React Query)
- **Services** are pure API call wrappers (testable API contracts)
- **API Client** handles cross-cutting concerns (auth, logging, activity tracking)

### Benefits
- Each layer is independently testable
- API URLs live in exactly one place (services)
- Components render with any data source (mock, real, store)
- Activity tracking is automatic (apiClient interceptor)

### Tradeoffs
- More files per feature (hook + service + component)
- Simple data fetches require more boilerplate

---

## AD-08: Permission as Pure Function

### Decision
Permission checking is a pure function (`hasPermission(userRole, requiredRole)`) with no store access, no side effects, and no authorization logic.

### Reason
Permission logic should be deterministic and testable. Embedding role comparison in a React hook or store:
- Makes it harder to test (need component wrapper)
- Encourages authorization logic to creep in
- Couples permission checks to React's component lifecycle

A pure function can be called anywhere — in hooks, guards, route definitions, or server-side code.

### Benefits
- Unit-testable in isolation
- Usable outside React (route generation, server-side)
- Impossible to have authorization bugs from stale state

### Tradeoffs
- Callers must provide the user role explicitly (no "magic" from context)

---

## AD-09: Provider Abstraction with Abstract Ports

### Decision
All AI providers (STT, LLM, TTS, VAD) are behind abstract interfaces (ports) in `runtime/ports.py`. The Runtime depends only on these interfaces, never on concrete implementations.

### Reason
The AI provider landscape changes rapidly. Locking into one provider creates migration pain. Abstract ports ensure:
- Providers can be swapped without Runtime changes
- Local development works without cloud API keys (local Whisper, Ollama, Kokoro)
- Testing uses mock providers
- Future cloud providers (OpenAI, Anthropic, ElevenLabs) are drop-in adapters

### Benefits
- Provider independence
- Testable Runtime with mock ports
- Parallel development (Runtime + providers)
- Production can use different providers than development

### Tradeoffs
- Interface design requires predicting provider capabilities
- Some provider-specific features may not fit the abstraction
- Performance overhead from the abstraction layer (negligible)

---

## AD-10: Zustand with Persist Middleware for Auth Tokens

### Decision
Auth tokens are stored in Zustand with the `persist` middleware (localStorage). Only tokens are persisted, not user data.

### Reason
- Tokens must survive page refresh (persisted)
- User data should be fetched fresh on each session (don't persist stale user objects)
- Zustand persist is simpler than jwt-decode + manual localStorage
- Partialize option allows persisting only selected state slices

### Benefits
- Single source of truth for auth state
- Fresh user data on every session (no stale cached profiles)
- Simple API (no custom localStorage read/write)
- Session restoration handled by AuthProvider

### Tradeoffs
- Zustand persist writes to localStorage on every state change (rare for auth)
- Token expiry is not checked by Zustand (handled by apiClient interceptor)

---

## AD-11: Agent Workspace Tabs as Separate Registry

### Decision
Agent workspace tabs (Overview, Prompt, Knowledge, etc.) are defined as a separate `agentWorkspaceTabs` array rather than entries in the main route registry.

### Reason
Agent tabs are parameterized (all under `/agents/[id]/`), conditionally rendered based on agent type, and follow a different access pattern than page routes. Mixing them with flat routes would:
- Require 11 entries for every agent (fine) but they'd all be hidden + parameterized
- Complicate the sidebar filtering logic
- Need a way to express "this is a tab, not a page"

### Benefits
- Clear separation between page routes and workspace tabs
- Tabs can have their own permission model
- Tab definition includes a dynamic `href(agentId)` function

### Tradeoffs
- Two registries to maintain
- Workspace tabs don't benefit from route registry helper functions

---

## AD-12: Feature Flags as Static Config

### Decision
Feature flags are defined as a static TypeScript object (`FEATURE_FLAGS`) in `config/features.ts`, loaded at build time for the frontend.

### Reason
- Build-time evaluation means dead-code elimination for disabled features
- No runtime overhead for flag evaluation
- Simple, predictable behavior
- Flags match the deployment environment (development vs production)

### Benefits
- Disabled features are tree-shaken by the bundler
- Zero runtime cost for flag checks
- Obvious which flags exist (single file)
- TypeScript provides autocomplete for flag names

### Tradeoffs
- Cannot toggle flags at runtime without redeployment
- Environment-specific flags need multiple builds
- No A/B testing capability (Phase 2+ may add runtime flag service)
