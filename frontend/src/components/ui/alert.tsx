'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type React from 'react';

// ─── Variants ─────────────────────────────────────────────────────────────────

const alertVariants = cva(
  'flex gap-3 rounded-lg border p-4 text-sm',
  {
    variants: {
      variant: {
        info: 'bg-info/5 border-info/20 text-info [&>svg]:text-info',
        success: 'bg-success/5 border-success/20 text-success [&>svg]:text-success',
        warning: 'bg-warning/5 border-warning/20 text-warning [&>svg]:text-warning',
        error: 'bg-error/5 border-error/20 text-error [&>svg]:text-error',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const iconMap: Record<string, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AlertProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof alertVariants> {
  /** Alert title (rendered in semibold) */
  title?: string;
  /** Alert body text */
  description?: string;
  /** Custom icon override (defaults to semantic icon for the variant) */
  icon?: LucideIcon;
  /** Action elements (buttons, links) rendered below the description */
  actions?: React.ReactNode;
  /** Hide the default icon */
  hideIcon?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Alert
 *
 * Contextual message with semantic color, icon, and optional actions.
 * Use for inline feedback — validation summaries, status messages,
 * success confirmations, error notices.
 *
 * @example
 * <Alert variant="error" title="Something went wrong">
 *   Please try again later.
 * </Alert>
 *
 * <Alert variant="success" title="Saved" description="Changes saved." />
 */
function Alert({
  className,
  variant = 'info',
  title,
  description,
  icon: CustomIcon,
  actions,
  hideIcon = false,
  children,
  ...props
}: AlertProps) {
  const Icon = CustomIcon ?? iconMap[variant ?? 'info'] ?? Info;

  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {!hideIcon && (
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      )}

      <div className="flex-1 space-y-1">
        {title && (
          <h5 className="font-semibold leading-5 text-foreground">{title}</h5>
        )}

        {(description || children) && (
          <div className="text-sm text-muted-foreground">
            {description || children}
          </div>
        )}

        {actions && (
          <div className="flex items-center gap-2 pt-1">{actions}</div>
        )}
      </div>
    </div>
  );
}

export { Alert, alertVariants };
