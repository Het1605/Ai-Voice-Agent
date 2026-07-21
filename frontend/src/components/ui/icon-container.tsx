'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type React from 'react';

// ─── Variants ─────────────────────────────────────────────────────────────────

const iconContainerVariants = cva(
  'inline-flex shrink-0 items-center justify-center',
  {
    variants: {
      size: {
        xs: 'h-5 w-5',
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
        xl: 'h-12 w-12',
      },
      shape: {
        square: 'rounded-md',
        rounded: 'rounded-lg',
        circle: 'rounded-full',
      },
      variant: {
        default: 'bg-muted text-muted-foreground',
        primary: 'bg-primary/10 text-primary',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        error: 'bg-error/10 text-error',
        info: 'bg-info/10 text-info',
        ghost: 'text-muted-foreground',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'square',
      variant: 'default',
    },
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IconContainerProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof iconContainerVariants> {
  /** Icon component to render */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * IconContainer
 *
 * Consistent wrapper for icons with size, shape, and color variants.
 * Use to give icons a background "bubble" or to enforce consistent sizing.
 *
 * @example
 * <IconContainer size="lg" shape="circle" variant="primary">
 *   <Bot className="h-5 w-5" />
 * </IconContainer>
 *
 * <IconContainer variant="error">
 *   <AlertTriangle className="h-4 w-4" />
 * </IconContainer>
 */
function IconContainer({
  className,
  size,
  shape,
  variant,
  icon,
  children,
  ...props
}: IconContainerProps) {
  return (
    <span
      className={cn(iconContainerVariants({ size, shape, variant }), className)}
      aria-hidden="true"
      {...props}
    >
      {icon ?? children}
    </span>
  );
}

export { IconContainer, iconContainerVariants };
