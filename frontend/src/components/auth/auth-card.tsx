'use client';

import { cn } from '@/lib/utils';
import { Wordmark } from '@/components/auth/wordmark';
import { Separator } from '@/components/ui/separator';
import type React from 'react';

export interface AuthCardProps {
  /** Heading text shown below the wordmark */
  title: string;
  /** Subtle description below the heading */
  subtitle?: string;
  /** Form content */
  children: React.ReactNode;
  /** Links / actions shown below a divider at the bottom of the card */
  footer?: React.ReactNode;
  /** Max-width of the card (default max-w-md) */
  maxWidth?: string;
  /** Additional class on the root wrapper */
  className?: string;
}

/**
 * AuthCard
 *
 * A single-surface auth page layout. NO nested boxes — just one clean card
 * per page with brand wordmark, title, form content, and footer links.
 *
 * The background is a full-viewport gradient using the brand palette.
 * The card itself is the only visible container.
 */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-md',
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12',
        'bg-gradient-to-br from-primary/5 via-background to-primary/5',
        className,
      )}
    >
      {/* Subtle dot-grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Gradient orbs */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />

      {/* Card — single surface, no nested boxes */}
      <div
        className={cn(
          'relative z-10 w-full rounded-xl border border-border bg-card p-8 shadow-sm',
          maxWidth,
        )}
      >
        {/* Wordmark */}
        <Wordmark className="mb-8" />

        {/* Title */}
        <h1 className="text-center text-h2 font-semibold tracking-tight text-foreground">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="mb-8 mt-1.5 text-center text-body-sm text-muted-foreground">
            {subtitle}
          </p>
        )}

        {/* Form content */}
        {children}

        {/* Footer divider + links */}
        {footer && (
          <>
            <Separator className="mb-6 mt-8" />
            <div className="flex flex-col items-center gap-2 text-center">
              {footer}
            </div>
          </>
        )}
      </div>
    </div>
  );
}