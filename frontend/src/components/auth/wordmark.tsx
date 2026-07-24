import { cn } from '@/lib/utils';
import type React from 'react';

export interface WordmarkProps extends React.ComponentProps<'div'> {
  /** Show the icon only (no text) — useful for compact spaces */
  iconOnly?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Wordmark
 *
 * VoiceGateway brand mark — a voice-wave icon + "VoiceGateway" wordmark.
 * Used at the top of auth screens and wherever brand presence is needed.
 */
export function Wordmark({
  className,
  iconOnly = false,
  size = 'md',
  ...props
}: WordmarkProps) {
  const iconSizes = { sm: 'h-7 w-7', md: 'h-9 w-9', lg: 'h-11 w-11' };
  const textSizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' };

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-3',
        className,
      )}
      {...props}
    >
      {/* Voice-wave icon */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('shrink-0', iconSizes[size])}
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle cx="20" cy="20" r="20" className="fill-primary" />

        {/* Wave bars */}
        <rect x="13" y="16" width="2" height="10" rx="1" className="fill-primary-foreground" />
        <rect x="17.5" y="12" width="2" height="18" rx="1" className="fill-primary-foreground" />
        <rect x="22" y="16" width="2" height="10" rx="1" className="fill-primary-foreground" />

        {/* Small dot */}
        <circle cx="24" cy="21" r="1.5" className="fill-primary-foreground" opacity="0.6" />
        <circle cx="11" cy="21" r="1.5" className="fill-primary-foreground" opacity="0.6" />
      </svg>

      {/* Wordmark text */}
      {!iconOnly && (
        <span
          className={cn(
            'font-semibold tracking-tight text-foreground',
            textSizes[size],
          )}
        >
          VoiceGateway
        </span>
      )}
    </div>
  );
}