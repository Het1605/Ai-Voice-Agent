'use client';

import {
  createContext,
  useContext,
  useId,
  useMemo,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type React from 'react';

// ═════════════════════════════════════════════════════════════════════════════
// FormField Context
// ═════════════════════════════════════════════════════════════════════════════

interface FormFieldContextValue {
  /** Field name (maps to form data key) */
  name: string;
  /** Unique field ID (auto-generated unless provided) */
  id: string;
  /** ID of the description element (for aria-describedby) */
  descriptionId: string;
  /** ID of the message/error element (for aria-describedby) */
  messageId: string;
  /** Whether the field is in an error state */
  invalid: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

function useFormField() {
  const ctx = useContext(FormFieldContext);
  if (!ctx) {
    throw new Error(
      'FormField components must be used within a <FormField>.'
    );
  }
  return ctx;
}

// ═════════════════════════════════════════════════════════════════════════════
// Form
// ═════════════════════════════════════════════════════════════════════════════

export interface FormProps extends React.ComponentProps<'form'> {
  /** Callback when the form is submitted */
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
}

/**
 * Form
 *
 * Semantic <form> wrapper with consistent spacing.
 * Use with FormField for accessible form layouts.
 *
 * @example
 * <Form onSubmit={handleSubmit}>
 *   <FormField name="email">
 *     <FormLabel>Email</FormLabel>
 *     <Input type="email" />
 *     <FormMessage />
 *   </FormField>
 * </Form>
 */
function Form({ className, children, onSubmit, ...props }: FormProps) {
  return (
    <form
      className={cn('space-y-6', className)}
      onSubmit={onSubmit}
      {...props}
    >
      {children}
    </form>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// FormField
// ═════════════════════════════════════════════════════════════════════════════

export interface FormFieldProps {
  /** Field name / key in form data */
  name: string;
  children: React.ReactNode;
  /** Custom field ID (auto-generated if omitted) */
  id?: string;
  /** Whether the field is in an error state */
  invalid?: boolean;
}

/**
 * FormField
 *
 * Provides field-level context (id, name, error state) to child
 * FormLabel, FormDescription, FormMessage, and input components.
 *
 * Wraps children in a flex column with consistent vertical gap.
 */
function FormField({
  name,
  children,
  id: externalId,
  invalid = false,
}: FormFieldProps) {
  const autoId = useId();
  const id = externalId ?? autoId;

  const value = useMemo<FormFieldContextValue>(
    () => ({
      name,
      id,
      descriptionId: `${id}-description`,
      messageId: `${id}-message`,
      invalid,
    }),
    [name, id, invalid]
  );

  return (
    <FormFieldContext.Provider value={value}>
      <div className="flex flex-col gap-1.5" role="group">
        {children}
      </div>
    </FormFieldContext.Provider>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// FormLabel
// ═════════════════════════════════════════════════════════════════════════════

export interface FormLabelProps extends React.ComponentProps<'label'> {
  /** Show required indicator asterisk */
  required?: boolean;
}

/**
 * FormLabel
 *
 * Accessible label linked to its form field via `htmlFor`.
 * Automatically connects to the parent FormField's id.
 * Optionally renders a RequiredIndicator.
 */
function FormLabel({
  className,
  children,
  required = false,
  ...props
}: FormLabelProps) {
  const { id } = useFormField();

  return (
    <label
      htmlFor={id}
      className={cn(
        'flex items-center gap-1 text-label font-medium text-foreground',
        className,
      )}
      {...props}
    >
      {children}
      {required && <RequiredIndicator />}
    </label>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// FormDescription
// ═════════════════════════════════════════════════════════════════════════════

export interface FormDescriptionProps extends React.ComponentProps<'p'> {}

/**
 * FormDescription
 *
 * Help text associated with a form field.
 * Linked via aria-describedby for accessibility.
 */
function FormDescription({ className, ...props }: FormDescriptionProps) {
  const { descriptionId } = useFormField();

  return (
    <p
      id={descriptionId}
      className={cn('text-body-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// FormMessage
// ═════════════════════════════════════════════════════════════════════════════

const formMessageVariants = cva('text-body-sm', {
  variants: {
    variant: {
      /** Error message (default, shown when field is invalid) */
      error: 'text-error',
      /** Info / hint message */
      info: 'text-muted-foreground',
      /** Success confirmation */
      success: 'text-success',
    },
  },
  defaultVariants: {
    variant: 'error',
  },
});

export interface FormMessageProps
  extends React.ComponentProps<'p'>,
    VariantProps<typeof formMessageVariants> {
  /** When true, hides the message (useful for conditional rendering) */
  hidden?: boolean;
}

/**
 * FormMessage
 *
 * Validation or status message for a form field.
 * Linked via aria-describedby for accessibility.
 * Hidden when `hidden` or when variant="error" and the field is not invalid.
 */
function FormMessage({
  className,
  variant = 'error',
  hidden,
  ...props
}: FormMessageProps) {
  const { messageId, invalid } = useFormField();

  // Don't render error messages when field is valid
  if (variant === 'error' && !invalid) {
    return null;
  }

  if (hidden) return null;

  return (
    <p
      id={messageId}
      role="alert"
      className={cn(formMessageVariants({ variant }), className)}
      {...props}
    />
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// RequiredIndicator
// ═════════════════════════════════════════════════════════════════════════════

export interface RequiredIndicatorProps extends React.ComponentProps<'span'> {}

/**
 * RequiredIndicator
 *
 * Visual asterisk marker for required form fields.
 * Renders `*` with the error/destructive color.
 */
function RequiredIndicator({ className, ...props }: RequiredIndicatorProps) {
  return (
    <span
      className={cn('text-error', className)}
      role="presentation"
      aria-hidden="true"
      {...props}
    >
      *
    </span>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Exports
// ═════════════════════════════════════════════════════════════════════════════

export {
  Form,
  FormField,
  FormLabel,
  FormDescription,
  FormMessage,
  RequiredIndicator,
  useFormField,
};
