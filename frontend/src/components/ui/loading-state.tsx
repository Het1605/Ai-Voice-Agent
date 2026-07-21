'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type React from 'react';

// ─── LoadingState ─────────────────────────────────────────────────────────────

export interface LoadingStateProps extends React.ComponentProps<'div'> {
  /** Loading text or element */
  message?: string;
  /** Show a spinner animation (default true) */
  spinner?: boolean;
  /** Show as a full-page centered block */
  fullPage?: boolean;
}

/**
 * LoadingState
 *
 * Centered loading indicator with optional message.
 * Use for page-level or section-level loading states.
 *
 * @example
 * <LoadingState message="Loading agents..." />
 * <LoadingState fullPage />
 */
function LoadingState({
  className,
  message = 'Loading...',
  spinner = true,
  fullPage = false,
  ...props
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12',
        fullPage && 'min-h-[60vh]',
        className,
      )}
      {...props}
    >
      {spinner && (
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground"
          aria-hidden="true"
        />
      )}
      {message && (
        <p className="text-body-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

// ─── LoadingSkeleton ──────────────────────────────────────────────────────────

export interface LoadingSkeletonProps extends React.ComponentProps<'div'> {
  /** Number of skeleton rows (default 3) */
  rows?: number;
  /** Skeleton variant */
  variant?: 'text' | 'card' | 'table-row';
}

/**
 * LoadingSkeleton
 *
 * Skeleton placeholder for loading content.
 * Renders multiple rows of animated skeletons.
 *
 * @example
 * <LoadingSkeleton rows={5} variant="table-row" />
 */
function LoadingSkeleton({
  className,
  rows = 3,
  variant = 'text',
  ...props
}: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)} role="status" aria-label="Loading content" {...props}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            variant === 'text' && 'h-4 w-full',
            variant === 'card' && 'h-24 w-full rounded-lg',
            variant === 'table-row' && 'h-8 w-full',
          )}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export { LoadingState, LoadingSkeleton };
