'use client';

import { cn } from '@/lib/utils';
import type React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Semantic element type (default div) */
  as?: 'div' | 'main' | 'section' | 'article';
}

/**
 * PageContainer
 *
 * Consistent horizontal padding wrapper for every page.
 * Use once per top-level page inside the main content area.
 *
 * Padding scales down on mobile and up on wide screens.
 * Pairs naturally with ContentContainer for max-width constraints.
 */
export function PageContainer({
  children,
  className,
  as: Tag = 'div',
}: PageContainerProps) {
  return (
    <Tag
      className={cn(
        // Responsive padding — tighter on mobile, comfortable on desktop
        'px-4 sm:px-6 lg:px-8 py-6 lg:py-8',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
