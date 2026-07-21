'use client';

import { cn } from '@/lib/utils';
import type React from 'react';

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional description / subtitle */
  description?: string;
  /** Action buttons or controls rendered on the right */
  actions?: React.ReactNode;
  /** Additional class on the root element */
  className?: string;
}

/**
 * PageHeader
 *
 * Top-of-page heading block with title, optional description,
 * and action slot. Use on every content page for visual consistency.
 *
 * Responsive: stacks title + actions vertically on small screens.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      {/* Title & description */}
      <div className="min-w-0 flex-1 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex shrink-0 items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
