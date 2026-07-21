'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type React from 'react';

// ─── Variants ─────────────────────────────────────────────────────────────────

const surfaceVariants = cva('', {
  variants: {
    /**
     * Surface hierarchy level.
     * - base: matches the page background
     * - card: elevated card surface (use for hover states)
     * - elevated: shadow + background (use for dropdowns/popovers)
     * - overlay: for modal/dialog surfaces
     */
    level: {
      base: 'bg-background text-foreground',
      card: 'bg-card text-card-foreground',
      elevated: 'bg-card text-card-foreground shadow-sm',
      overlay: 'bg-popover text-popover-foreground shadow-lg',
    },
    /** Border treatment */
    bordered: {
      true: 'border',
      false: 'border-0',
    },
    /** Padding density */
    padding: {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    },
    /** Border radius */
    radius: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
    },
  },
  defaultVariants: {
    level: 'base',
    bordered: false,
    padding: 'none',
    radius: 'none',
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SurfaceProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof surfaceVariants> {
  as?: 'div' | 'section' | 'article' | 'aside';
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Surface
 *
 * Low-level background + border + padding primitive.
 * Use to apply consistent surface hierarchy without adding a new component.
 *
 * @example
 * <Surface level="card" padding="md" radius="lg" bordered>
 *   Content
 * </Surface>
 */
function Surface({
  className,
  level,
  bordered,
  padding,
  radius,
  as: Tag = 'div',
  ...props
}: SurfaceProps) {
  return (
    <Tag
      className={cn(surfaceVariants({ level, bordered, padding, radius }), 'border-border', className)}
      {...props}
    />
  );
}

export { Surface, surfaceVariants };
