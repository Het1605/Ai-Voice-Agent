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

const bannerVariants = cva(
  'relative flex w-full items-center justify-center gap-2 px-4 py-2 text-center text-sm font-medium',
  {
    variants: {
      variant: {
        info: 'bg-info text-info-foreground',
        success: 'bg-success text-success-foreground',
        warning: 'bg-warning text-warning-foreground',
        error: 'bg-error text-error-foreground',
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

export interface BannerProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof bannerVariants> {
  message: string;
  /** Optional action label rendered as a link/button */
  actionLabel?: string;
  /** Called when the action is clicked */
  onAction?: () => void;
  /** Show dismiss button */
  dismissible?: boolean;
  onDismiss?: () => void;
  hideIcon?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Banner
 *
 * Full-width top-of-page notification bar.
 * Use for global announcements — maintenance, outages, new features.
 */
function Banner({
  className,
  variant = 'info',
  message,
  actionLabel,
  onAction,
  dismissible = false,
  onDismiss,
  hideIcon = false,
  ...props
}: BannerProps) {
  const Icon = iconMap[variant ?? 'info'] ?? Info;

  return (
    <div
      role="alert"
      className={cn(bannerVariants({ variant }), className)}
      {...props}
    >
      {!hideIcon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}

      <span className="truncate">{message}</span>

      {actionLabel && onAction && (
        <Button
          variant="link"
          size="xs"
          className="shrink-0 text-inherit underline-offset-4 hover:underline"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}

      {dismissible && onDismiss && (
        <Button
          variant="ghost"
          size="icon-xs"
          className="shrink-0 text-inherit opacity-70 hover:opacity-100"
          onClick={onDismiss}
          aria-label="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

export { Banner, bannerVariants };
