'use client';

import { cn } from '@/lib/utils';
import type React from 'react';

export interface FieldGroupProps extends React.ComponentProps<'div'> {
  /** Columns at small breakpoint (default 1) */
  columns?: 1 | 2 | 3;
}

/**
 * FieldGroup
 *
 * Groups related form fields into a multi-column grid layout.
 * Each child field automatically gets consistent spacing.
 *
 * @example
 * <FieldGroup columns={2}>
 *   <FormField name="firstName">...</FormField>
 *   <FormField name="lastName">...</FormField>
 * </FieldGroup>
 */
function FieldGroup({
  className,
  columns = 1,
  ...props
}: FieldGroupProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-3',
        className,
      )}
      {...props}
    />
  );
}

export { FieldGroup };
