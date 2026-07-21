'use client';

import { cn } from '@/lib/utils';
import type React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProgressRingProps extends React.ComponentProps<'div'> {
  /** Progress value 0–100 */
  value: number;
  /** Ring size in px (default 40) */
  size?: number;
  /** Stroke width in px (default 3) */
  strokeWidth?: number;
  /** Track color (default muted) */
  trackClassName?: string;
  /** Indicator color (default primary) */
  indicatorClassName?: string;
  /** Show percentage label in center */
  showLabel?: boolean;
  /** Label class override */
  labelClassName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ProgressRing
 *
 * Circular SVG progress indicator.
 * Use for async uploads, completion scores, or anywhere
 * a visual progress percentage is needed.
 *
 * @example
 * <ProgressRing value={75} size={48} showLabel />
 * <ProgressRing value={100} size={32} indicatorClassName="text-success" />
 */
function ProgressRing({
  value: rawValue,
  size = 40,
  strokeWidth = 3,
  trackClassName,
  indicatorClassName,
  showLabel = false,
  labelClassName,
  className,
  ...props
}: ProgressRingProps) {
  const value = Math.min(100, Math.max(0, rawValue));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const center = size / 2;

  return (
    <div
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${Math.round(value)}%`}
      {...props}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={cn('stroke-muted', trackClassName)}
        />
        {/* Indicator */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            'stroke-primary transition-all duration-500 ease-out',
            indicatorClassName,
          )}
        />
      </svg>

      {showLabel && (
        <span
          className={cn(
            'absolute text-xs font-medium tabular-nums text-foreground',
            labelClassName,
          )}
        >
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
}

export { ProgressRing };
