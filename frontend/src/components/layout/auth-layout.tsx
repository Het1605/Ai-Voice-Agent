'use client';

import { cn } from '@/lib/utils';
import type React from 'react';

export interface AuthLayoutProps {
  /** Form or content to render inside the card */
  children: React.ReactNode;
  /** Optional title rendered above the content */
  title?: string;
  /** Optional description rendered below the title */
  description?: string;
  /** Show the ambient background glow (default true) */
  showGlow?: boolean;
  /** Max-width of the content card (default max-w-md) */
  maxWidth?: string;
  /** Additional class on the root wrapper */
  className?: string;
}

/**
 * AuthLayout
 *
 * Clean, centered layout for authentication pages (login, register,
 * forgot-password, etc.). Renders content inside a max-width container
 * with optional ambient glow, title, and description.
 */
export function AuthLayout({
  children,
  title,
  description,
  showGlow = true,
  maxWidth = 'max-w-md',
  className,
}: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-screen items-center justify-center overflow-hidden bg-background',
        className,
      )}
    >
      {/* Ambient background glow */}
      {showGlow && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>
      )}

      {/* Content card */}
      <div className={cn('relative z-10 w-full px-4 animate-in-fade', maxWidth)}>
        {title && (
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
