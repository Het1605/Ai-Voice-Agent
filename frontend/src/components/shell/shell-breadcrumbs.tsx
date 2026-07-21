'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppShell } from './app-shell-provider';
import { useShellStore } from '@/store/shell-store';
import type { RouteDefinition } from '@/navigation';

export interface ShellBreadcrumbsProps {
  /** Override the breadcrumb items (e.g. for dynamic pages) */
  items?: RouteDefinition[];
  className?: string;
}

/**
 * ShellBreadcrumbs
 *
 * Route-registry-driven breadcrumb trail.
 * Automatically generates breadcrumbs from the current page's
 * route hierarchy, respecting any label overrides.
 *
 * Use `items` prop for dynamic pages (agent detail, call detail)
 * that aren't in the static route registry.
 *
 * @example
 * <ShellBreadcrumbs />
 * <ShellBreadcrumbs items={customBreadcrumbs} />
 */
export function ShellBreadcrumbs({
  items: externalItems,
  className,
}: ShellBreadcrumbsProps) {
  const { breadcrumbs } = useAppShell();
  const breadcrumbOverrides = useShellStore((s) => s.breadcrumbOverrides);

  const items = externalItems ?? breadcrumbs;

  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm', className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const label = breadcrumbOverrides[item.id] ?? item.title;

        return (
          <span key={item.id} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
            )}
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
