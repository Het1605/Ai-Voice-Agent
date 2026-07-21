'use client';

import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';
import type React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface EmptyStateProps extends React.ComponentProps<'div'> {
  /** Icon rendered in a muted circle */
  icon?: LucideIcon;
  /** Empty state heading */
  title?: string;
  /** Supporting description */
  description?: string;
  /** Primary CTA element */
  action?: React.ReactNode;
  /** Show as full-page centered */
  fullPage?: boolean;
}

/**
 * EmptyState
 *
 * Centered empty-state display for lists, tables, and search results
 * that have no data. Use instead of a zero-item list.
 *
 * @example
 * <EmptyState
 *   icon={Bot}
 *   title="No agents yet"
 *   description="Create your first agent to get started."
 *   action={<Button>Create Agent</Button>}
 * />
 */
function EmptyState({
  className,
  icon: Icon,
  title,
  description,
  action,
  fullPage = false,
  children,
  ...props
}: EmptyStateProps) {
  // If children provided, render them directly
  if (children) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-12 text-center',
          fullPage && 'min-h-[60vh]',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 text-center',
        fullPage && 'min-h-[60vh]',
        className,
      )}
      {...props}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
      )}

      <div className="space-y-1">
        {title && (
          <Text weight="semibold" color="default">{title}</Text>
        )}
        {description && (
          <Text size="sm" color="muted" className="max-w-sm">{description}</Text>
        )}
      </div>

      {action && (
        <div className="mt-2">{action}</div>
      )}
    </div>
  );
}

export { EmptyState };
