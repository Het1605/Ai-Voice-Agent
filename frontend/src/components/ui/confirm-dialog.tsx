'use client';

import {
  AlertTriangle,
  Info,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConfirmVariant = 'default' | 'destructive' | 'warning';

export interface ConfirmDialogProps {
  /** Open state control */
  open: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Dialog title (default "Are you sure?") */
  title?: string;
  /** Dialog description */
  description?: string;
  /** Label for the confirm button (default "Continue") */
  confirmLabel?: string;
  /** Label for the cancel button (default "Cancel") */
  cancelLabel?: string;
  /** Variant controls color and icon (default "default") */
  variant?: ConfirmVariant;
  /** Custom icon (overrides the variant default) */
  icon?: LucideIcon;
  /** Called when the user confirms */
  onConfirm?: () => void;
  /** Called when the user cancels */
  onCancel?: () => void;
  /** Confirm button loading state */
  loading?: boolean;
  /** Disable the confirm button */
  disabled?: boolean;
  /** Trigger element (if you want uncontrolled usage) */
  trigger?: React.ReactNode;
  /** Additional content rendered in the body */
  children?: React.ReactNode;
}

// ─── Variant Config ───────────────────────────────────────────────────────────

const variantConfig: Record<
  ConfirmVariant,
  { icon: LucideIcon; confirmVariant: 'default' | 'destructive'; iconClass: string }
> = {
  default: {
    icon: Info,
    confirmVariant: 'default',
    iconClass: 'text-primary',
  },
  destructive: {
    icon: Trash2,
    confirmVariant: 'destructive',
    iconClass: 'text-error',
  },
  warning: {
    icon: AlertTriangle,
    confirmVariant: 'default',
    iconClass: 'text-warning',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ConfirmDialog
 *
 * Accessible confirmation modal for destructive or important actions.
 * Built on the Dialog primitive with semantic variant styling.
 *
 * @example
 * <ConfirmDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   variant="destructive"
 *   title="Delete agent?"
 *   description="This action cannot be undone."
 *   confirmLabel="Delete"
 *   onConfirm={handleDelete}
 * />
 */
function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
  variant = 'default',
  icon: CustomIcon,
  onConfirm,
  onCancel,
  loading = false,
  disabled = false,
  trigger,
  children,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = CustomIcon ?? config.icon;

  const content = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader className="flex flex-row items-start gap-3">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted', config.iconClass.replace('text-', 'bg-').replace('error', 'error/10').replace('warning', 'warning/10').replace('primary', 'primary/10'))}>
          <Icon className={cn('h-5 w-5', config.iconClass)} />
        </div>
        <div className="flex-1 space-y-1">
          <DialogTitle>{title}</DialogTitle>
          {(description || children) && (
            <DialogDescription>
              {description || children}
            </DialogDescription>
          )}
        </div>
      </DialogHeader>

      <DialogFooter showCloseButton={false}>
        <Button
          variant="outline"
          onClick={() => {
            onCancel?.();
            onOpenChange?.(false);
          }}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={config.confirmVariant}
          onClick={() => {
            onConfirm?.();
          }}
          disabled={disabled || loading}
        >
          {loading ? 'Loading...' : confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  // If a trigger is provided, let Dialog control open state
  if (trigger) {
    return (
      <Dialog>
        <DialogTrigger>{trigger}</DialogTrigger>
        {content}
      </Dialog>
    );
  }

  // Controlled mode
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  );
}

// Need `cn` for icon container background
import { cn } from '@/lib/utils';

export { ConfirmDialog };
