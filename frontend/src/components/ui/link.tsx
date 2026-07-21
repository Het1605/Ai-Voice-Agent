'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import NextLink from 'next/link';
import type React from 'react';

// ─── Variants ─────────────────────────────────────────────────────────────────

const linkVariants = cva(
  'inline-flex items-center gap-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm',
  {
    variants: {
      variant: {
        /** Primary accent link (matches brand/primary color) */
        default:
          'text-primary underline-offset-4 hover:underline',
        /** Subtle link that blends with surrounding text */
        muted:
          'text-muted-foreground underline-offset-4 hover:text-foreground hover:underline',
        /** Always-underlined link for inline text emphasis */
        underlined:
          'text-primary underline decoration-primary/30 hover:decoration-primary',
        /** Ghost link that underlines only on hover */
        ghost:
          'text-foreground hover:text-primary',
      },
      size: {
        sm: 'text-body-sm',
        md: 'text-body',
        lg: 'text-body-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LinkProps
  extends Omit<React.ComponentProps<typeof NextLink>, 'href'>,
    VariantProps<typeof linkVariants> {
  href: string;
  /** Open in new tab (adds target="_blank" rel="noopener noreferrer") */
  external?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Link
 *
 * Token-driven navigation link built on Next.js `Link`.
 * Supports visual variants for placement in text, navigation,
 * and action contexts.
 *
 * @example
 * <Link href="/settings">Settings</Link>
 * <Link href="https://docs.example.com" variant="muted" external>
 *   Documentation
 * </Link>
 */
function Link({
  className,
  variant,
  size,
  external = false,
  children,
  ...props
}: LinkProps) {
  const externalProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <NextLink
      className={cn(linkVariants({ variant, size }), className)}
      {...externalProps}
      {...props}
    >
      {children}
    </NextLink>
  );
}

export { Link, linkVariants };
