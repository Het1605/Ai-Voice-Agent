'use client';

import { cn } from '@/lib/utils';
import type React from 'react';

export interface EmptyLayoutProps {
  children?: React.ReactNode;
  /** Icon element rendered above the title */
  icon?: React.ReactNode;
  /** Primary empty-state heading */
  title?: string;
  /** Supporting description text */
  description?: string;
  /** Primary CTA button or action element */
  action?: React.ReactNode;
  className?: string;
}

/**
 * EmptyLayout
 *
 * Centered empty-state placeholder for pages or sections that
 * have no data yet. Centered both vertically and horizontally.
 *
 * Accepts children as an alternative to the title/description/action
 * props — use `children` for fully custom content.
 *
 * Examples:
 *   <EmptyLayout
 *     icon={<Inbox className="h-12 w-12" />}
 *     title="No agents yet"
 *     description="Create your first agent to get started."
 *     action={<Button>Create Agent</Button>}
 *   />
 *
 *   <EmptyLayout>
 *     <CustomEmptyState />
 *   </EmptyLayout>
 */
export function EmptyLayout({
  children,
  icon,
  title,
  description,
  action,
  className,
}: EmptyLayoutProps) {
  // If children are provided, render them directly
  if (children) {
    return (
      <div
        className={cn(
          'flex min-h-[400px] w-full flex-col items-center justify-center',
          'px-4 py-12 text-center',
          className,
        )}
      >
        {children}
      </div>
    );
  }

  // Otherwise render the structured empty state
  return (
    <div
      className={cn(
        'flex min-h-[400px] w-full flex-col items-center justify-center',
        'px-4 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 text-muted-foreground">{icon}</div>
      )}
      {title && (
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      )}
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">{action}</div>
      )}
    </div>
  );
}
