'use client';

import { useEffect, useRef } from 'react';
import { cva } from 'class-variance-authority';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToastStore, type ToastVariant } from './toast-store';

// ─── Style Maps ───────────────────────────────────────────────────────────────

const toastVariants = cva(
  'pointer-events-auto flex w-full items-start gap-3 rounded-lg border p-4 text-sm shadow-lg transition-all duration-300 sm:w-96',
  {
    variants: {
      variant: {
        info: 'bg-popover border-border text-foreground',
        success: 'bg-success/5 border-success/20 text-foreground',
        warning: 'bg-warning/5 border-warning/20 text-foreground',
        error: 'bg-error/5 border-error/20 text-foreground',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const iconMap: Record<ToastVariant, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const iconColorMap: Record<ToastVariant, string> = {
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};

// ─── Toast Item ───────────────────────────────────────────────────────────────

function ToastItem({ id }: { id: string }) {
  const toast = useToastStore((s) => s.toasts.find((t) => t.id === id));
  const dismiss = useToastStore((s) => s.dismiss);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (toast && toast.duration > 0) {
      timerRef.current = setTimeout(() => dismiss(id), toast.duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast, id, dismiss]);

  if (!toast) return null;

  const Icon = toast.icon ?? iconMap[toast.variant];

  return (
    <div
      role="alert"
      className={cn(toastVariants({ variant: toast.variant }), 'animate-in slide-in-from-right-2 fade-in')}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconColorMap[toast.variant])} aria-hidden="true" />

      <div className="flex-1 space-y-0.5">
        {toast.title && (
          <p className="font-semibold text-foreground">{toast.title}</p>
        )}
        {toast.description && (
          <p className="text-muted-foreground">{toast.description}</p>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon-xs"
        className="shrink-0 -mr-1 -mt-1"
        onClick={() => dismiss(id)}
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ─── Toaster ──────────────────────────────────────────────────────────────────

export interface ToasterProps {
  /** Positioning (default bottom-right) */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Max visible toasts (default 5) */
  max?: number;
  className?: string;
}

/**
 * Toaster
 *
 * Renders the toast notification container.
 * Place once at the root layout level.
 *
 * @example
 * // In root layout:
 * <Toaster position="bottom-right" max={5} />
 */
function Toaster({
  position = 'bottom-right',
  max = 5,
  className,
}: ToasterProps) {
  const toasts = useToastStore((s) => s.toasts);

  const positionClass = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  }[position];

  return (
    <div
      className={cn(
        'fixed z-[var(--z-toast)] flex flex-col gap-2 pointer-events-none',
        positionClass,
        className,
      )}
    >
      {toasts.slice(-max).map((t) => (
        <ToastItem key={t.id} id={t.id} />
      ))}
    </div>
  );
}

export { Toaster };
