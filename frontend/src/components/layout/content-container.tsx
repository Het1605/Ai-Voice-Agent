'use client';

import { cn } from '@/lib/utils';
import type React from 'react';

export interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Maximum width override.
   * Defaults to the --content-max-width CSS variable (80rem / 1280px).
   * Common overrides: 'max-w-3xl', 'max-w-5xl', 'max-w-full'.
   */
  maxWidth?: string;
}

/**
 * ContentContainer
 *
 * Max-width-constrained wrapper that centers content.
 * Use inside PageContainer to prevent content from stretching
 * too wide on large screens while keeping backgrounds full-width.
 *
 * Example:
 *   <PageContainer>
 *     <ContentContainer>
 *       <PageHeader title="..." />
 *     </ContentContainer>
 *   </PageContainer>
 */
export function ContentContainer({
  children,
  className,
  maxWidth,
}: ContentContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        maxWidth ?? 'max-w-[var(--content-max-width)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
