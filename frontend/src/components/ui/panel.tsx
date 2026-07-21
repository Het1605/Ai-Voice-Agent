'use client';

import { cn } from '@/lib/utils';
import type React from 'react';

export interface PanelProps extends React.ComponentProps<'div'> {
  /** Panel title */
  title?: string;
  /** Panel description */
  description?: string;
  /** Actions rendered in the header */
  actions?: React.ReactNode;
  /** Padding density (default "md") */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Remove border */
  noBorder?: boolean;
  /** Variant */
  variant?: 'default' | 'raised' | 'bordered';
}

/**
 * Panel
 *
 * Composed container combining Surface, header area, and content area.
 * One step higher than Surface — includes title/description/actions.
 *
 * @example
 * <Panel title="Analytics" description="Key metrics at a glance">
 *   Chart content here
 * </Panel>
 */
function Panel({
  className,
  title,
  description,
  actions,
  padding = 'md',
  noBorder = false,
  variant = 'default',
  children,
  ...props
}: PanelProps) {
  const paddingClass = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  }[padding];

  const variantClass = {
    default: 'bg-card text-card-foreground rounded-xl',
    raised: 'bg-card text-card-foreground rounded-xl shadow-sm',
    bordered: 'bg-card text-card-foreground rounded-xl border border-border',
  }[variant];

  return (
    <div
      className={cn(variantClass, !noBorder && 'ring-1 ring-foreground/10', className)}
      {...props}
    >
      {/* Header */}
      {(title || actions) && (
        <div className={cn(
          'flex items-start justify-between gap-4',
          paddingClass,
          // When there's a title + content, add bottom spacing
          children && 'pb-0',
          // Add a separator when there's content below
          children && 'border-b border-border pb-4 mb-4',
        )}>
          <div className="min-w-0 flex-1 space-y-0.5">
            {title && (
              <h3 className="text-base font-semibold leading-6 text-foreground">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-body-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {children && (
        <div className={cn(paddingClass, 'pt-0', !title && !actions && paddingClass)}>
          {children}
        </div>
      )}
    </div>
  );
}

export { Panel };
