'use client';

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { routes, getRouteByHref } from '@/navigation/routes';
import { hasPermission, type PermissionRole } from '@/navigation/permissions';
import { FEATURE_FLAGS } from '@/config/features';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GuardBehavior = 'redirect' | 'hide' | 'fallback';

export interface RouteGuardProps {
  /** Children to render if access is allowed */
  children: React.ReactNode;
  /** What to do when access is denied (default 'redirect') */
  onDenied?: GuardBehavior;
  /** Fallback element to render when onDenied='fallback' */
  fallback?: React.ReactNode;
  /** Redirect path when onDenied='redirect' (default '/login') */
  redirectTo?: string;
  /** Optional route override — useful for guarding dynamic routes */
  routeHref?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * RouteGuard
 *
 * Thin permission + feature-flag gate.
 * Looks up the current route from the registry, checks the user's role
 * and the required feature flag, then either renders children or
 * redirects / hides / shows fallback.
 *
 * Designed to wrap client layout groups or individual pages.
 * Delegates all checks to pure functions — no business logic here.
 *
 * @example
 * // In (admin)/layout.tsx:
 * <RouteGuard onDenied="redirect" redirectTo="/dashboard">
 *   {children}
 * </RouteGuard>
 */
export function RouteGuard({
  children,
  onDenied = 'redirect',
  fallback,
  redirectTo = '/login',
  routeHref,
}: RouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const check = useMemo(() => {
    const href = routeHref ?? pathname;
    const route = getRouteByHref(href);

    // If no route matches, allow access
    if (!route) return { allowed: true, reason: null };

    // Permission check
    const userRole = (user?.role ?? 'guest') as PermissionRole;
    if (!hasPermission(userRole, route.permission)) {
      return { allowed: false, reason: 'permission' as const };
    }

    // Feature flag check
    if (
      route.featureFlag &&
      !FEATURE_FLAGS[route.featureFlag as keyof typeof FEATURE_FLAGS]
    ) {
      return { allowed: false, reason: 'featureFlag' as const };
    }

    return { allowed: true, reason: null };
  }, [pathname, routeHref, user?.role]);

  // Handle denial
  if (!check.allowed) {
    switch (onDenied) {
      case 'redirect': {
        // Unauthenticated users always go to login
        const target = !accessToken ? '/login' : redirectTo;
        // Use setTimeout to avoid React state updates during render
        setTimeout(() => router.push(target), 0);
        return null;
      }
      case 'hide':
        return null;
      case 'fallback':
        return <>{fallback ?? null}</>;
    }
  }

  return <>{children}</>;
}
