'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type React from 'react';
import type { LucideIcon } from 'lucide-react';

// ─── ErrorState ───────────────────────────────────────────────────────────────

export interface ErrorStateProps extends React.ComponentProps<'div'> {
  /** Error title (default "Something went wrong") */
  title?: string;
  /** Error description */
  description?: string;
  /** Custom icon */
  icon?: LucideIcon;
  /** Label for the retry button */
  retryLabel?: string;
  /** Called when the user clicks retry */
  onRetry?: () => void;
  /** Show as full-page centered */
  fullPage?: boolean;
}

/**
 * ErrorState
 *
 * Error display with icon, message, and optional retry button.
 * Use after a failed API call or operation.
 *
 * @example
 * <ErrorState
 *   title="Failed to load agents"
 *   description="Check your connection and try again."
 *   onRetry={refetch}
 * />
 */
function ErrorState({
  className,
  title = 'Something went wrong',
  description,
  icon: CustomIcon,
  retryLabel = 'Try again',
  onRetry,
  fullPage = false,
  ...props
}: ErrorStateProps) {
  const Icon = CustomIcon ?? AlertTriangle;

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 text-center',
        fullPage && 'min-h-[60vh]',
        className,
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
        <Icon className="h-6 w-6 text-error" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <Text weight="semibold" color="default">
          {title}
        </Text>
        {description && (
          <Text size="sm" color="muted" className="max-w-sm">
            {description}
          </Text>
        )}
      </div>

      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export { ErrorState };
