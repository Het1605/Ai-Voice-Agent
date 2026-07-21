'use client';

import { cn } from '@/lib/utils';
import type React from 'react';

export interface ActionGroupProps extends React.ComponentProps<'div'> {
  /** Alignment (default "end") */
  align?: 'start' | 'end' | 'center';
  /** Spacing density (default "md") */
  spacing?: 'sm' | 'md' | 'lg';
  /** Stretch children to fill width */
  stretch?: boolean;
}

/**
 * ActionGroup
 *
 * Consistent button / action layout for dialogs, forms,
 * and page footers. Handles alignment and spacing.
 *
 * @example
 * <ActionGroup>
 *   <Button variant="outline">Cancel</Button>
 *   <Button>Save</Button>
 * </ActionGroup>
 *
 * <ActionGroup align="start">
 *   <Button variant="ghost">Back</Button>
 * </ActionGroup>
 */
function ActionGroup({
  className,
  align = 'end',
  spacing = 'md',
  stretch = false,
  children,
  ...props
}: ActionGroupProps) {
  const spacingClass = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  }[spacing];

  const alignClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  }[align];

  return (
    <div
      className={cn(
        'flex items-center',
        spacingClass,
        alignClass,
        stretch && '*:flex-1',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { ActionGroup };
