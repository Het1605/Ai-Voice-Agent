'use client';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import type React from 'react';

export interface ToolbarProps extends React.ComponentProps<'div'> {
  /** Visual density (default "default") */
  density?: 'default' | 'compact';
  /** Show bottom border */
  bordered?: boolean;
}

/**
 * Toolbar
 *
 * Horizontal action bar for table headers, form toolbars,
 * and page action areas. Groups buttons, filters, and controls.
 *
 * @example
 * <Toolbar>
 *   <Button variant="outline" size="sm">Filter</Button>
 *   <Button size="sm">Create</Button>
 * </Toolbar>
 */
function Toolbar({
  className,
  density = 'default',
  bordered = false,
  children,
  ...props
}: ToolbarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 flex-wrap',
        density === 'default' ? 'min-h-10 py-1' : 'min-h-8 py-0.5',
        bordered && 'border-b border-border pb-3 mb-3',
        className,
      )}
      role="toolbar"
      aria-orientation="horizontal"
      {...props}
    >
      {children}
    </div>
  );
}

export interface ToolbarGroupProps extends React.ComponentProps<'div'> {
  /** Don't render the separator before this group */
  noSeparator?: boolean;
}

/**
 * ToolbarGroup
 *
 * Segments a Toolbar into logical groups with separators.
 *
 * @example
 * <Toolbar>
 *   <ToolbarGroup>
 *     <Button>Create</Button>
 *   </ToolbarGroup>
 *   <ToolbarGroup>
 *     <Button variant="outline">Export</Button>
 *   </ToolbarGroup>
 * </Toolbar>
 */
function ToolbarGroup({
  className,
  noSeparator = false,
  children,
  ...props
}: ToolbarGroupProps) {
  return (
    <>
      {!noSeparator && (
        <Separator
          orientation="vertical"
          className="h-5 mx-1"
        />
      )}
      <div
        className={cn('flex items-center gap-2', className)}
        {...props}
      >
        {children}
      </div>
    </>
  );
}

export { Toolbar, ToolbarGroup };
