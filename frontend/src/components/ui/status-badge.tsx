'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type React from 'react';

// ─── Status Variants ──────────────────────────────────────────────────────────

const statusDotVariants = cva('h-1.5 w-1.5 rounded-full shrink-0', {
  variants: {
    variant: {
      active: 'bg-success',
      inactive: 'bg-muted-foreground',
      pending: 'bg-warning',
      draft: 'bg-muted-foreground',
      error: 'bg-error',
      archived: 'bg-muted-foreground',
      success: 'bg-success',
      warning: 'bg-warning',
      info: 'bg-info',
    },
  },
  defaultVariants: {
    variant: 'inactive',
  },
});

const statusBadgeVariants = cva('gap-1.5 px-2 py-0.5', {
  variants: {
    variant: {
      active: 'border-success/30 bg-success/5 text-success',
      inactive: 'border-border bg-muted text-muted-foreground',
      pending: 'border-warning/30 bg-warning/5 text-warning',
      draft: 'border-border bg-muted text-muted-foreground',
      error: 'border-error/30 bg-error/5 text-error',
      archived: 'border-border bg-muted text-muted-foreground',
      success: 'border-success/30 bg-success/5 text-success',
      warning: 'border-warning/30 bg-warning/5 text-warning',
      info: 'border-info/30 bg-info/5 text-info',
    },
  },
  defaultVariants: {
    variant: 'inactive',
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatusVariant =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'draft'
  | 'error'
  | 'archived'
  | 'success'
  | 'warning'
  | 'info';

export interface StatusBadgeProps {
  /** The status variant — controls color + label */
  variant: StatusVariant;
  /** Optional custom label (defaults to the variant name) */
  label?: string;
  /** Show the status dot indicator */
  showDot?: boolean;
  className?: string;
}

// ─── Status Labels ────────────────────────────────────────────────────────────

const defaultLabels: Record<StatusVariant, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  draft: 'Draft',
  error: 'Error',
  archived: 'Archived',
  success: 'Success',
  warning: 'Warning',
  info: 'Info',
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * StatusBadge
 *
 * Semantic status indicator with consistent color coding.
 * Renders on top of the Badge component with an optional dot.
 *
 * @example
 * <StatusBadge variant="active" />
 * <StatusBadge variant="pending" label="Awaiting review" showDot={false} />
 */
function StatusBadge({
  variant,
  label,
  showDot = true,
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusBadgeVariants({ variant }), className)}
    >
      {showDot && (
        <span
          className={cn(statusDotVariants({ variant }))}
          aria-hidden="true"
        />
      )}
      {label ?? defaultLabels[variant]}
    </Badge>
  );
}

export { StatusBadge };
