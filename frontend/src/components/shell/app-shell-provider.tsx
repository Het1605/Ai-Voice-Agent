'use client';

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { useNavigation } from '@/navigation';
import { useShellStore } from '@/store/shell-store';
import type { NavigationGroup, RouteDefinition } from '@/navigation';
import type { ExtensionPosition } from './extension-registry';
import { ShellExtensionRegistry } from './extension-registry';
import { useRef } from 'react';

// ═════════════════════════════════════════════════════════════════════════════
// Context
// ═════════════════════════════════════════════════════════════════════════════

export interface AppShellContextValue {
  // ── Navigation ───────────────────────────────────────────────────────
  /** Routes the current user can see (permission + feature-flag filtered) */
  navigationGroups: NavigationGroup[];
  /** Current matching route definition */
  currentRoute: RouteDefinition | null;
  /** Breadcrumb trail for the current page */
  breadcrumbs: RouteDefinition[];

  // ── Sidebar ──────────────────────────────────────────────────────────
  collapsed: boolean;
  toggleCollapsed: () => void;
  expandedGroups: Set<string>;
  toggleGroup: (group: string) => void;

  // ── Feature flags ────────────────────────────────────────────────────
  hasFeature: (flag: string) => boolean;
  canAccess: (routeId: string) => boolean;

  // ── Extensions ───────────────────────────────────────────────────────
  /** Get rendered components at a given position */
  getExtensionsAt: (position: ExtensionPosition) => ReactNode[];

  // ── Route transitions ────────────────────────────────────────────────
  /** True during page transitions */
  isNavigating: boolean;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShell(): AppShellContextValue {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error('useAppShell must be used within an AppShellProvider');
  }
  return ctx;
}

// ═════════════════════════════════════════════════════════════════════════════
// Provider
// ═════════════════════════════════════════════════════════════════════════════

export interface AppShellProviderProps {
  children: ReactNode;
  /** Optional: provide extensions to register into the shell */
  extensions?: ShellExtensionRegistry;
}

/**
 * AppShellProvider
 *
 * Provides navigation state, sidebar state, and extension rendering
 * to all shell components below it.
 *
 * This is a UI-only provider — it does NOT own auth, org, or business state.
 * It reads the user's role from auth-store to filter navigation, but
 * the store itself lives outside this provider.
 */
export function AppShellProvider({
  children,
  extensions: externalExtensions,
}: AppShellProviderProps) {
  const pathname = usePathname();
  const [registry] = useState(() => externalExtensions ?? new ShellExtensionRegistry());
  const [isNavigating, setIsNavigating] = useState(false);

  // Navigation state
  const {
    navigationGroups,
    currentRoute,
    breadcrumbs,
    canAccess,
    hasFeature,
  } = useNavigation();

  // Sidebar state
  const collapsed = useShellStore((s) => s.collapsed);
  const toggleCollapsed = useShellStore((s) => s.toggleCollapsed);
  const expandedGroups = useShellStore((s) => s.expandedGroups);
  const toggleGroup = useShellStore((s) => s.toggleGroup);

  // Track route transitions
  const prevPathname = useRef(pathname);
  if (prevPathname.current !== pathname) {
    setIsNavigating(true);
    prevPathname.current = pathname;
    // Reset after a short delay (actual loading is covered by activity-store)
    setTimeout(() => setIsNavigating(false), 300);
  }

  const getExtensionsAt = useCallback(
    (position: ExtensionPosition): ReactNode[] => {
      return registry.getByPosition(position).map((ext) => (
        <span key={ext.id} data-extension={ext.id}>
          {ext.component}
        </span>
      ));
    },
    [registry],
  );

  const value = useMemo<AppShellContextValue>(
    () => ({
      navigationGroups,
      currentRoute,
      breadcrumbs,
      collapsed,
      toggleCollapsed,
      expandedGroups,
      toggleGroup,
      hasFeature,
      canAccess,
      getExtensionsAt,
      isNavigating,
    }),
    [
      navigationGroups,
      currentRoute,
      breadcrumbs,
      collapsed,
      toggleCollapsed,
      expandedGroups,
      toggleGroup,
      hasFeature,
      canAccess,
      getExtensionsAt,
      isNavigating,
    ],
  );

  return (
    <AppShellContext.Provider value={value}>
      {children}
    </AppShellContext.Provider>
  );
}

