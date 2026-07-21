'use client';

import { cn } from '@/lib/utils';
import type React from 'react';

export interface PageActionsProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageActions
 *
 * Inline group for PageHeader action buttons.
 * Provides consistent spacing and alignment.
 *
 * Example:
 *   <PageHeader
 *     title="Agents"
 *     actions={
 *       <PageActions>
 *         <Button variant="outline">Export</Button>
 *         <Button>Create Agent</Button>
 *       </PageActions>
 *     }
 *   />
 */
export function PageActions({ children, className }: PageActionsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {children}
    </div>
  );
}
