'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  routes,
  groupRoutes,
  getRouteByHref,
  getRouteChain,
  type RouteDefinition,
} from './routes';
import { hasPermission, type PermissionRole } from './permissions';
import { FEATURE_FLAGS } from '@/config/features';
import { useAuthStore } from '@/store/auth-store';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavigationGroup {
  title: string | undefined;
  items: RouteDefinition[];
}

export interface UseNavigationReturn {
  /** All routes the current user can see, filtered by role + flags */
  visibleRoutes: RouteDefinition[];

  /** Routes grouped by their `group` field, for sidebar rendering */
  navigationGroups: NavigationGroup[];

  /** The route definition matching the current pathname */
  currentRoute: RouteDefinition | null;

  /** Breadcrumb trail for the current page */
  breadcrumbs: RouteDefinition[];

  /** Check whether the user can access a specific route */
  canAccess: (routeId: string) => boolean;

  /** Check whether a feature flag is enabled */
  hasFeature: (flag: string) => boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useNavigation
 *
 * Consumed by the shell context. Returns filtered routes,
 * current route metadata, breadcrumbs, and access-check helpers.
 *
 * Reads user role from auth-store and checks feature flags from config.
 */
export function useNavigation(): UseNavigationReturn {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  // Derive role from user object
  const userRole: PermissionRole | null = user?.role as PermissionRole ?? null;

  const visibleRoutes = useMemo(() => {
    return routes.filter((route) => {
      // Hidden routes are excluded from sidebar navigation
      if (route.hidden) return false;
      // Permission check
      if (!hasPermission(userRole, route.permission)) return false;
      // Feature flag check
      if (route.featureFlag && !FEATURE_FLAGS[route.featureFlag as keyof typeof FEATURE_FLAGS]) return false;
      return true;
    });
  }, [userRole]);

  const navigationGroups = useMemo(() => {
    const grouped = groupRoutes(visibleRoutes);
    const orderedGroups = ['main', 'org', 'admin'];
    const result: NavigationGroup[] = [];

    for (const key of orderedGroups) {
      const items = grouped[key];
      if (!items || items.length === 0) continue;
      result.push({
        title: key === 'main' ? undefined : key === 'org' ? 'Organization' : key === 'admin' ? 'Administration' : key,
        items,
      });
    }

    // Add any remaining groups not in the ordered list
    for (const key of Object.keys(grouped)) {
      if (!orderedGroups.includes(key) && grouped[key].length > 0) {
        result.push({ title: key, items: grouped[key] });
      }
    }

    return result;
  }, [visibleRoutes]);

  const currentRoute = useMemo(() => {
    return getRouteByHref(pathname) ?? null;
  }, [pathname]);

  const breadcrumbs = useMemo(() => {
    return getRouteChain(pathname);
  }, [pathname]);

  const canAccess = useMemo(() => {
    return (routeId: string): boolean => {
      const route = routes.find((r) => r.id === routeId);
      if (!route) return false;
      return hasPermission(userRole, route.permission);
    };
  }, [userRole]);

  const hasFeature = (flag: string): boolean => {
    return FEATURE_FLAGS[flag as keyof typeof FEATURE_FLAGS] ?? false;
  };

  return {
    visibleRoutes,
    navigationGroups,
    currentRoute,
    breadcrumbs,
    canAccess,
    hasFeature,
  };
}
