'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type React from 'react';

// ─── Variants ─────────────────────────────────────────────────────────────────

const noticeVariants = cva(
  'relative flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-sm',
  {
    variants: {
      variant: {
        info: 'bg-info/10 border-info/30 text-info',
        success: 'bg-success/10 border-success/30 text-success',
        warning: 'bg-warning/10 border-warning/30 text-warning',
        error: 'bg-error/10 border-error/30 text-error',
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

export interface NoticeProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof noticeVariants> {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  /** Show dismiss button */
  dismissible?: boolean;
  /** Called when the notice is dismissed */
  onDismiss?: () => void;
  hideIcon?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Notice
 *
 * More prominent than Alert — used for persistent in-section notices
 * like subscription warnings, trial expirations, or important updates.
 * Supports dismissal.
 */
function Notice({
  className,
  variant = 'info',
  title,
  description,
  icon: CustomIcon,
  dismissible = false,
  onDismiss,
  hideIcon = false,
  children,
  ...props
}: NoticeProps) {
  const Icon = CustomIcon ?? iconMap[variant ?? 'info'] ?? Info;

  return (
    <div
      role="alert"
      className={cn(noticeVariants({ variant }), className)}
      {...props}
    >
      {!hideIcon && (
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      )}

      <div className="flex-1 space-y-0.5">
        {title && (
          <p className="font-semibold text-foreground">{title}</p>
        )}
        {(description || children) && (
          <div className="text-muted-foreground">
            {description || children}
          </div>
        )}
      </div>

      {dismissible && onDismiss && (
        <Button
          variant="ghost"
          size="icon-xs"
          className="shrink-0 -mr-1 -mt-1"
          onClick={onDismiss}
          aria-label="Dismiss notice"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

export { Notice, noticeVariants };
