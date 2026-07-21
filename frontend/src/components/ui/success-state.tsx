'use client';

import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';
import type React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface SuccessStateProps extends React.ComponentProps<'div'> {
  /** Success title */
  title?: string;
  /** Success description */
  description?: string;
  /** Custom icon */
  icon?: LucideIcon;
  /** Action elements rendered below the description */
  actions?: React.ReactNode;
  /** Show as full-page centered */
  fullPage?: boolean;
}

/**
 * SuccessState
 *
 * Success confirmation display with icon and message.
 * Use after successful operations (created, saved, updated).
 *
 * @example
 * <SuccessState
 *   title="Agent created"
 *   description="Your new agent is ready."
 *   actions={<Button>View Agent</Button>}
 * />
 */
function SuccessState({
  className,
  title = 'Success',
  description,
  icon: CustomIcon,
  actions,
  fullPage = false,
  ...props
}: SuccessStateProps) {
  const Icon = CustomIcon ?? CheckCircle2;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 text-center',
        fullPage && 'min-h-[60vh]',
        className,
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
        <Icon className="h-6 w-6 text-success" aria-hidden="true" />
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

      {actions && (
        <div className="mt-2 flex items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

export { SuccessState };
