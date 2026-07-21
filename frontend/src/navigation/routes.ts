/**
 * Route Registry — Single Source of Truth
 *
 * Every route in the product is defined here as a flat entry.
 * The Sidebar, Breadcrumbs, Search, RouteGuard, and analytics
 * all consume this same configuration.
 *
 * Adding a new route = one entry here. No scattered configs.
 *
 * Guideline for groups:
 *   "main"   → primary sidebar section (Dashboard, Agents, Calls…)
 *   "org"    → organization section (Team, Billing, Settings…)
 *   "admin"  → system management (hidden from client sidebar)
 *   "auth"   → authentication pages (hidden from sidebar)
 */

import {
  LayoutDashboard,
  Bot,
  Phone,
  BookOpen,
  BarChart3,
  Users,
  CreditCard,
  Puzzle,
  Settings,
  Shield,
  Building2,
  UserCog,
  FileSearch,
  type LucideIcon,
} from 'lucide-react';
import type { PermissionRole } from './permissions';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RouteDefinition {
  /** Unique route identifier — namespaced, e.g. "agents.list", "agents.detail" */
  id: string;
  /** Human-readable page title (drives <title>, breadcrumbs, nav labels) */
  title: string;
  /** URL path — static paths only; dynamic segments use the parent + params pattern */
  href: string;
  /** Icon for sidebar / navigation */
  icon?: LucideIcon;
  /** Sidebar group label. Omit or set empty for items not in sidebar. */
  group?: string;
  /** Parent route id — drives breadcrumb hierarchy */
  parentId?: string;
  /** Minimum role required to see this route */
  permission?: PermissionRole;
  /** Feature flag that must be enabled to see this route */
  featureFlag?: string;
  /** Badge shown on the nav item (number or short text) */
  badge?: string | number;
  /** Hide from sidebar nav (e.g. detail pages that are navigated to from a list) */
  hidden?: boolean;
  /** Sort order within its group (lower = first) */
  order?: number;
  /** Route description — for search indexing and meta tags */
  description?: string;
  /** Search keywords for command palette / global search */
  keywords?: string[];
  /** Exact match pattern for route matching (overrides prefix match) */
  exact?: boolean;
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const routes: RouteDefinition[] = [
  // ── Main ──────────────────────────────────────────────────────────────
  {
    id: 'dashboard',
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    group: 'main',
    permission: 'member',
    order: 1,
    description: 'Platform overview and key metrics',
  },
  {
    id: 'agents.list',
    title: 'Agents',
    href: '/agents',
    icon: Bot,
    group: 'main',
    permission: 'member',
    order: 2,
    description: 'Manage AI voice agents',
  },
  {
    id: 'calls.list',
    title: 'Calls',
    href: '/calls',
    icon: Phone,
    group: 'main',
    permission: 'member',
    order: 3,
    description: 'Call history and recordings',
  },
  {
    id: 'knowledge.list',
    title: 'Knowledge',
    href: '/knowledge',
    icon: BookOpen,
    group: 'main',
    permission: 'member',
    order: 4,
    description: 'Knowledge bases and documents',
  },
  {
    id: 'analytics.overview',
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    group: 'main',
    permission: 'member',
    order: 5,
    description: 'Usage analytics and reports',
  },

  // ── Organization ──────────────────────────────────────────────────────
  {
    id: 'team.list',
    title: 'Team',
    href: '/team',
    icon: Users,
    group: 'org',
    permission: 'member',
    order: 1,
    description: 'Manage team members and roles',
  },
  {
    id: 'billing.overview',
    title: 'Billing',
    href: '/billing',
    icon: CreditCard,
    group: 'org',
    permission: 'admin',
    featureFlag: 'enableStripeBilling',
    order: 2,
    description: 'Subscription and invoices',
  },
  {
    id: 'integrations.list',
    title: 'Integrations',
    href: '/integrations',
    icon: Puzzle,
    group: 'org',
    permission: 'admin',
    order: 3,
    description: 'Third-party integrations',
  },
  {
    id: 'settings.general',
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    group: 'org',
    permission: 'member',
    order: 4,
    description: 'Organization settings',
  },

  // ── Admin (hidden from regular sidebar) ───────────────────────────────
  {
    id: 'admin.dashboard',
    title: 'Admin Dashboard',
    href: '/admin/dashboard',
    icon: Shield,
    group: 'admin',
    permission: 'admin',
    hidden: true,
    order: 1,
  },
  {
    id: 'admin.organizations',
    title: 'Organizations',
    href: '/admin/organizations',
    icon: Building2,
    group: 'admin',
    permission: 'admin',
    hidden: true,
    order: 2,
  },
  {
    id: 'admin.users',
    title: 'Users',
    href: '/admin/users',
    icon: UserCog,
    group: 'admin',
    permission: 'admin',
    hidden: true,
    order: 3,
  },
  {
    id: 'admin.audit-logs',
    title: 'Audit Logs',
    href: '/admin/audit-logs',
    icon: FileSearch,
    group: 'admin',
    permission: 'admin',
    hidden: true,
    order: 4,
  },
];

// ─── Agent Workspace Tabs (parameterized, not in main registry) ───────────────

export interface AgentTabDefinition {
  key: string;
  title: string;
  href: (agentId: string) => string;
  permission?: PermissionRole;
  featureFlag?: string;
}

export const agentWorkspaceTabs: AgentTabDefinition[] = [
  { key: 'overview',   title: 'Overview',   href: (id) => `/agents/${id}/overview` },
  { key: 'prompt',     title: 'Prompt',     href: (id) => `/agents/${id}/prompt` },
  { key: 'knowledge',  title: 'Knowledge',  href: (id) => `/agents/${id}/knowledge` },
  { key: 'voice',      title: 'Voice',      href: (id) => `/agents/${id}/voice` },
  { key: 'tools',      title: 'Tools',      href: (id) => `/agents/${id}/tools` },
  { key: 'variables',  title: 'Variables',  href: (id) => `/agents/${id}/variables` },
  { key: 'testing',    title: 'Testing',    href: (id) => `/agents/${id}/testing` },
  { key: 'calls',      title: 'Calls',      href: (id) => `/agents/${id}/calls` },
  { key: 'analytics',  title: 'Analytics',  href: (id) => `/agents/${id}/analytics` },
  { key: 'versions',   title: 'Versions',   href: (id) => `/agents/${id}/versions` },
  { key: 'deploy',     title: 'Deploy',     href: (id) => `/agents/${id}/deploy` },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

/** Look up a route definition by its `id`. */
export function getRouteById(id: string): RouteDefinition | undefined {
  return routes.find((r) => r.id === id);
}

/** Look up a route definition by its `href`. */
export function getRouteByHref(href: string): RouteDefinition | undefined {
  // Check exact match first
  const exact = routes.find((r) => r.href === href);
  if (exact) return exact;
  // Fall back to prefix match (for nested routes under a parent)
  return routes.find((r) => href.startsWith(r.href) && r.exact !== false);
}

/** Get the parent chain for breadcrumb generation. */
export function getRouteChain(href: string): RouteDefinition[] {
  const chain: RouteDefinition[] = [];
  let route = getRouteByHref(href);
  while (route) {
    chain.unshift(route);
    route = route.parentId ? getRouteById(route.parentId) : undefined;
  }
  return chain;
}

/** Group routes by their `group` field. */
export function groupRoutes(routeList: RouteDefinition[]): Record<string, RouteDefinition[]> {
  const groups: Record<string, RouteDefinition[]> = {};
  for (const route of routeList) {
    const g = route.group || '_ungrouped';
    if (!groups[g]) groups[g] = [];
    groups[g].push(route);
  }
  // Sort each group by order
  for (const g of Object.keys(groups)) {
    groups[g].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }
  return groups;
}
