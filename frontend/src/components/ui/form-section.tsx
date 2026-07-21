'use client';

import { cn } from '@/lib/utils';
import type React from 'react';

export interface FormSectionProps extends React.ComponentProps<'div'> {
  /** Section heading */
  title?: string;
  /** Section description */
  description?: string;
  /** Actions rendered in the header area */
  actions?: React.ReactNode;
}

/**
 * FormSection
 *
 * A titled, visually grouped section within a form.
 * Provides a heading + description + optional actions at the top,
 * and renders child form fields below.
 *
 * @example
 * <FormSection
 *   title="Profile Information"
 *   description="Update your personal details."
 * >
 *   <FieldGroup columns={2}>
 *     <FormField name="firstName">...</FormField>
 *     <FormField name="lastName">...</FormField>
 *   </FieldGroup>
 * </FormSection>
 */
function FormSection({
  className,
  title,
  description,
  actions,
  children,
  ...props
}: FormSectionProps) {
  return (
    <div
      className={cn('space-y-5', className)}
      {...props}
    >
      {/* Header */}
      {(title || actions) && (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
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

      {/* Fields */}
      <div className="space-y-5">
        {children}
      </div>
    </div>
  );
}

export { FormSection };
