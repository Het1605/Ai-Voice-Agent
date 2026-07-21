'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type React from 'react';

// ─── Variants ─────────────────────────────────────────────────────────────────

const textVariants = cva(
  // Base: apply Inter font, proper antialiasing
  'text-foreground',
  {
    variants: {
      size: {
        xs: 'text-small',
        sm: 'text-body-sm',
        md: 'text-body',
        lg: 'text-body-lg',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
      color: {
        default: 'text-foreground',
        muted: 'text-muted-foreground',
        primary: 'text-primary',
        success: 'text-success',
        warning: 'text-warning',
        error: 'text-error',
        info: 'text-info',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
    },
    defaultVariants: {
      size: 'md',
      weight: 'normal',
      color: 'default',
    },
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TextProps
  extends Omit<React.ComponentProps<'p'>, 'color'>,
    VariantProps<typeof textVariants> {
  /** Semantic element (default p) */
  as?: 'p' | 'span' | 'div' | 'label';
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Text
 *
 * Primary body typography component. Consumes the theme's text-size
 * tokens and provides consistent weight / color variants.
 *
 * @example
 * <Text size="sm" color="muted">
 *   Updated 2 hours ago
 * </Text>
 *
 * <Text weight="semibold">Section heading</Text>
 */
function Text({
  className,
  size,
  weight,
  color,
  align,
  as: Tag = 'p',
  ...props
}: TextProps) {
  const Comp = Tag as React.ElementType;
  return (
    <Comp
      className={cn(textVariants({ size, weight, color, align }), className)}
      {...props}
    />
  );
}

export { Text, textVariants };
