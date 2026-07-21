'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type React from 'react';

// ─── Variants ─────────────────────────────────────────────────────────────────

const captionVariants = cva(
  'text-caption',
  {
    variants: {
      color: {
        default: 'text-foreground',
        muted: 'text-muted-foreground',
      },
    },
    defaultVariants: {
      color: 'muted',
    },
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CaptionProps
  extends Omit<React.ComponentProps<'span'>, 'color'>,
    VariantProps<typeof captionVariants> {}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Caption
 *
 * Small secondary text for timestamps, helper notes, labels,
 * and other subordinate content. Uses the theme `text-caption` token.
 *
 * @example
 * <Caption>Updated 2 hours ago</Caption>
 * <Caption color="default">Filed under: Billing</Caption>
 */
function Caption({ className, color, ...props }: CaptionProps) {
  return (
    <span
      className={cn(captionVariants({ color }), className)}
      {...props}
    />
  );
}

export { Caption, captionVariants };
